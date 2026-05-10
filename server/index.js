import dotenv from "dotenv";
import dns from "node:dns";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcrypt";
import cors from "cors";
import { parse } from "csv-parse/sync";
import express from "express";
import mongoose from "mongoose";

import MapAnalysisModel from "./Models/MapAnalysis.js";
import RentalListingModel from "./Models/RentalListing.js";
import UserModel from "./Models/UserModel.js";
import {
  buildLocationAnalysis,
  normalizeAnalysisInput,
  seedRentalListings,
} from "./utils/mapAnalysis.js";
import rentalSeedData from "./data/rentalSeedData.js";
import {
  BUSINESS_OSM_CATEGORIES,
  getBusinessCategoryMapping,
  getRelevantAnchorCategories,
  poiMatchesCategories,
  resolveDirectCompetitorPois,
} from "./utils/businessTypeMapping.js";
import { calculateDistanceKm } from "./utils/geoUtils.js";
import { rankLocations } from "./utils/locationScoring.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = Number(process.env.PORT) || 3003;
const mongoUri = process.env.MONGO_URI;
const hasMongoUri = Boolean(mongoUri);
console.log("MongoDB URI loaded:", hasMongoUri);

const dnsServers = process.env.DNS_SERVERS;
if (dnsServers) {
  dns.setServers(
    dnsServers
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean)
  );
  console.log("Custom DNS servers enabled for MongoDB SRV lookup");
}

const MIN_PASSWORD_LENGTH = 8;
const LOCATION_FEATURES_PATH = path.join(
  __dirname,
  "data",
  "processed",
  "location_features.json"
);
const OSM_POIS_SOHAR_PATH = path.join(
  __dirname,
  "data",
  "processed",
  "osm_pois_sohar.json"
);
const OMAN_LOCATIONS_PATH = path.join(
  __dirname,
  "data",
  "raw",
  "oman_locations.csv"
);
const RELATIVE_LOCATION_FEATURES_PATH =
  "data/processed/location_features.json";
const RELATIVE_OSM_POIS_SOHAR_PATH =
  "data/processed/osm_pois_sohar.json";
const RELATIVE_RENTAL_SEED_DATA_PATH = "data/rentalSeedData.js";

mongoose.set("strictQuery", true);

app.use(express.json());
app.use(cors());

function redactMongoCredentials(value = "") {
  return String(value).replace(
    /(mongodb(?:\+srv)?:\/\/)([^:\s/@]+):([^@\s]+)(@)/gi,
    "$1***:***$4"
  );
}

function getMongoConnectionFailureReason(error) {
  const code = error?.code || "";
  const message = String(error?.message || "");
  const details = `${code} ${message}`.toLowerCase();

  if (details.includes("querysrv") || details.includes("econnrefused")) {
    return "DNS/network issue resolving MongoDB Atlas SRV records. Check local DNS, firewall, VPN/proxy, or try a different network/DNS resolver.";
  }

  if (details.includes("enotfound") || details.includes("etimeout")) {
    return "DNS/network issue reaching MongoDB Atlas. Verify internet/DNS access from this machine.";
  }

  if (details.includes("authentication failed") || code === 8000) {
    return "MongoDB username or password is incorrect, or the user does not have access to the selected database.";
  }

  if (details.includes("bad auth")) {
    return "MongoDB authentication failed. Check the database username and password in MONGO_URI.";
  }

  if (details.includes("ip") && details.includes("whitelist")) {
    return "Atlas Network Access may not include this machine's current public IP address.";
  }

  if (details.includes("invalid scheme") || details.includes("uri")) {
    return "MONGO_URI format appears invalid. Use the Atlas mongodb+srv URI with the /riadatech database name.";
  }

  return "Unable to classify automatically. Check the sanitized error fields above.";
}

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeUser(userDocument) {
  const user = userDocument?.toObject ? userDocument.toObject() : userDocument;

  if (!user) {
    return null;
  }

  const { password, __v, ...safeUser } = user;
  return safeUser;
}

function normalizeIpAddress(ipAddress = "") {
  return String(ipAddress || "")
    .split(",")[0]
    .trim()
    .replace(/^::ffff:/, "");
}

function formatLocationResponse(payload, provider) {
  return {
    ip: payload.ip || payload.ip_address || payload.query || "",
    country: payload.location?.country || payload.country || "",
    region: payload.location?.region || payload.regionName || payload.region || "",
    city: payload.location?.city || payload.city || "",
    timezone: payload.location?.timezone || payload.timezone?.id || payload.timezone || "",
    coordinates: {
      lat: payload.location?.lat ?? payload.latitude ?? payload.lat ?? null,
      lng: payload.location?.lng ?? payload.longitude ?? payload.lon ?? null,
    },
    provider,
  };
}

function normalizeSearchText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function buildRecommendationExplanations(area, businessType) {
  const mapping = getBusinessCategoryMapping(businessType);
  const competitorLabel =
    area.competitors === 1 ? "1 direct competitor" : `${area.competitors} direct competitors`;
  const explanation_en = `${area.area_name} scores ${area.score}/100 for ${mapping.labels.en} based on normalized population, business activity, startup activity, complementary POIs, and ${competitorLabel}. Population is ${formatNumber(area.population)}, with ${formatNumber(area.total_businesses)} tracked business POIs and ${formatNumber(area.startups_count)} governorate-level startups.`;
  const explanation_ar = `${area.area_name} حصلت على ${area.score}/100 لفئة ${mapping.labels.ar} بناءً على بيانات السكان، النشاط التجاري، الشركات الناشئة، الخدمات المكملة، والمنافسة. عدد السكان ${formatNumber(area.population)}، وعدد الأنشطة التجارية المرصودة ${formatNumber(area.total_businesses)}، وعدد الشركات الناشئة على مستوى المحافظة ${formatNumber(area.startups_count)}.`;

  return {
    explanation: explanation_en,
    explanation_ar,
    explanation_en,
  };
}

function roundTo(value, digits = 2) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Number(numericValue.toFixed(digits));
}

function toFiniteNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function isSoharCity(city = "") {
  return normalizeSearchText(city || "Sohar") === "sohar";
}

function cleanPoiName(name, fallback = "Unnamed competitor") {
  const cleanName = String(name || "").trim();
  return cleanName || fallback;
}

async function readJsonArray(filePath) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function readSoharPois(city = "Sohar") {
  if (!isSoharCity(city)) {
    return [];
  }

  const pois = await readJsonArray(OSM_POIS_SOHAR_PATH);

  return pois
    .map((poi) => ({
      ...poi,
      latitude: toFiniteNumber(poi.latitude),
      longitude: toFiniteNumber(poi.longitude),
      category: String(poi.category || "").trim(),
      source: poi.source || "OpenStreetMap",
    }))
    .filter((poi) => poi.category && poi.latitude !== null && poi.longitude !== null);
}

async function readLocationFeatures() {
  return readJsonArray(LOCATION_FEATURES_PATH);
}

function getSoharFeature(features) {
  return (
    features.find((area) => {
      const areaNameKey = normalizeSearchText(area.area_name);
      const wilayatKey = normalizeSearchText(area.wilayat);

      return areaNameKey === "sohar" || wilayatKey === "sohar";
    }) || {}
  );
}

async function readOmanLocationRows() {
  const raw = await readFile(OMAN_LOCATIONS_PATH, "utf8");

  return parse(raw, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

function buildVillageCandidates(rows, city = "Sohar") {
  const cityKey = normalizeSearchText(city || "Sohar");
  const candidatesByName = new Map();

  rows
    .filter((row) => normalizeSearchText(row.Wallyat_Name_English) === cityKey)
    .forEach((row) => {
      const areaName = String(row.Village_Name_English || "").trim();
      const latitude = toFiniteNumber(row.Village_Latitude);
      const longitude = toFiniteNumber(row.Village_Longitude);

      if (!areaName || latitude === null || longitude === null) {
        return;
      }

      const key = normalizeSearchText(areaName);

      if (!candidatesByName.has(key)) {
        candidatesByName.set(key, {
          area_name: areaName,
          governorate: "Al Batinah North",
          wilayat: "Sohar",
          latitude,
          longitude,
          source: "oman_locations.csv",
          anchor_poi_name: null,
          anchor_poi_category: null,
          anchor_poi_osm_id: null,
          data_source_notes: "Village-level candidate from oman_locations.csv.",
          data_source_notes_ar: "مرشح على مستوى القرية من ملف oman_locations.csv.",
          data_source_notes_en: "Village-level candidate from oman_locations.csv.",
        });
      }
    });

  const candidates = Array.from(candidatesByName.values());
  const uniqueCoordinateCount = new Set(
    candidates.map((candidate) =>
      `${candidate.latitude.toFixed(5)},${candidate.longitude.toFixed(5)}`
    )
  ).size;

  return uniqueCoordinateCount > 1 ? candidates : [];
}

function buildOsmClusterCandidates(pois, city = "Sohar", businessType = "Coffee Shop") {
  const mapping = getBusinessCategoryMapping(businessType);
  const directContext = resolveDirectCompetitorPois(pois, mapping);

  if (!mapping.generic && directContext.directPois.length > 0) {
    return directContext.directPois.map((anchorPoi) => {
      const anchorName = cleanPoiName(anchorPoi.name, mapping.labels.en);

      return {
        area_name: `${city} area near ${anchorName}`,
        governorate: "Al Batinah North",
        wilayat: city || "Sohar",
        latitude: anchorPoi.latitude,
        longitude: anchorPoi.longitude,
        source: "OpenStreetMap category anchor",
        anchor_poi_name: anchorName,
        anchor_poi_category: anchorPoi.category,
        anchor_poi_osm_id: anchorPoi.osm_id ?? null,
        data_source_notes:
          "Generated from a real OpenStreetMap POI matching the selected business category.",
        data_source_notes_ar:
          directContext.data_source_notes_ar ||
          "تم إنشاء هذا الموقع من نقطة OpenStreetMap حقيقية مرتبطة بفئة النشاط المحددة.",
        data_source_notes_en:
          directContext.data_source_notes_en ||
          "Generated from a real OpenStreetMap POI matching the selected business category.",
      };
    });
  }

  const anchorCategorySet = new Set(getRelevantAnchorCategories(mapping));
  const anchorPois = pois.filter((poi) => {
    if (mapping.generic) {
      return BUSINESS_OSM_CATEGORIES.includes(poi.category);
    }

    return anchorCategorySet.has(poi.category);
  });
  const gridSize = 0.02;
  const clusters = new Map();

  anchorPois.forEach((poi) => {
    const latBucket = Math.floor(poi.latitude / gridSize);
    const lngBucket = Math.floor(poi.longitude / gridSize);
    const key = `${latBucket}:${lngBucket}`;

    if (!clusters.has(key)) {
      clusters.set(key, []);
    }

    clusters.get(key).push(poi);
  });

  return Array.from(clusters.values())
    .filter((clusterPois) => clusterPois.length >= 2)
    .map((clusterPois) => {
      const latitude =
        clusterPois.reduce((sum, poi) => sum + poi.latitude, 0) / clusterPois.length;
      const longitude =
        clusterPois.reduce((sum, poi) => sum + poi.longitude, 0) / clusterPois.length;
      const anchorPoi =
        clusterPois.find((poi) => String(poi.name || "").trim()) || clusterPois[0];
      const anchorName = cleanPoiName(anchorPoi.name, "commercial activity");

      return {
        area_name: `${city} area near ${anchorName}`,
        governorate: "Al Batinah North",
        wilayat: city || "Sohar",
        latitude,
        longitude,
        source: "OpenStreetMap POI cluster",
        anchor_poi_name: anchorName,
        anchor_poi_category: anchorPoi.category,
        anchor_poi_osm_id: anchorPoi.osm_id ?? null,
        data_source_notes:
          "Generated from a real OpenStreetMap POI cluster in Sohar; anchor POI exists in osm_pois_sohar.json.",
        data_source_notes_ar:
          "تم إنشاء هذا الموقع من تجمع حقيقي لنقاط OpenStreetMap في صحار، ونقطة الارتكاز موجودة في osm_pois_sohar.json.",
        data_source_notes_en:
          "Generated from a real OpenStreetMap POI cluster in Sohar; the anchor POI exists in osm_pois_sohar.json.",
      };
    });
}

function normalizeValue(value, min, max) {
  const numericValue = Number(value) || 0;
  const numericMin = Number(min) || 0;
  const numericMax = Number(max) || 0;

  if (numericMax <= numericMin) {
    return numericValue > 0 ? 1 : 0;
  }

  return Math.min(Math.max((numericValue - numericMin) / (numericMax - numericMin), 0), 1);
}

function buildRange(values) {
  const numericValues = values.map((value) => Number(value) || 0);

  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
  };
}

function getCompetitorUnavailableMessage(mapping) {
  if (mapping.generic) {
    return {
      message_ar:
        mapping.genericNoteAr ||
        "لم يتم تحديد فئة نشاط دقيقة، لذلك لا توجد منافسة مباشرة محددة.",
      message_en:
        mapping.genericNoteEn ||
        "No precise business category was selected, so direct competition is not category-specific.",
    };
  }

  return {
    message_ar: "لا توجد بيانات كافية عن المنافسين المباشرين لهذه الفئة في النطاق المحدد.",
    message_en:
      "There is not enough direct competitor data for this category in the selected area.",
  };
}

function getAlternativeUnavailableMessage() {
  return {
    message_ar: "لا توجد بيانات كافية لاقتراح مواقع بديلة موثوقة لهذه الفئة حاليًا.",
    message_en:
      "There is not enough data to suggest reliable alternative locations for this category yet.",
  };
}

function countPoisWithinRadius(candidate, pois, mapping, radiusKm = 2) {
  const nearbyPois = pois.filter((poi) => {
    const distanceKm = calculateDistanceKm(
      candidate.latitude,
      candidate.longitude,
      poi.latitude,
      poi.longitude
    );

    return distanceKm !== null && distanceKm <= radiusKm;
  });
  const competitorResolution = resolveDirectCompetitorPois(nearbyPois, mapping);
  const directPoiKeys = new Set(
    competitorResolution.directPois.map((poi) => `${poi.osm_type || ""}:${poi.osm_id}`)
  );
  const complementaryPois = nearbyPois.filter((poi) => {
    if (directPoiKeys.has(`${poi.osm_type || ""}:${poi.osm_id}`)) {
      return false;
    }

    return poiMatchesCategories(poi, mapping.complementaryCategories || []);
  });
  const businessPois = nearbyPois.filter((poi) => BUSINESS_OSM_CATEGORIES.includes(poi.category));

  return {
    total_businesses: businessPois.length,
    direct_competitors: competitorResolution.directPois.length,
    competitors: competitorResolution.directPois.length,
    complementary_pois: complementaryPois.length,
    data_quality: competitorResolution.data_quality,
    category_confidence: competitorResolution.category_confidence,
    data_source_notes_ar: competitorResolution.data_source_notes_ar || "",
    data_source_notes_en: competitorResolution.data_source_notes_en || "",
  };
}

function scoreAlternativeCandidates(candidates, pois, businessType, context) {
  const mapping = getBusinessCategoryMapping(businessType);
  const allCategoryResolution = resolveDirectCompetitorPois(pois, mapping);
  const hasDirectOrProxyData =
    mapping.generic ||
    allCategoryResolution.directPois.length > 0 ||
    allCategoryResolution.relatedPois.length > 0;

  if (!hasDirectOrProxyData) {
    return {
      alternatives: [],
      data_quality: "insufficient",
      ...getAlternativeUnavailableMessage(mapping),
    };
  }

  const enrichedCandidates = candidates
    .map((candidate) => ({
      ...candidate,
      ...countPoisWithinRadius(candidate, pois, mapping, 2),
      population: Number(context.population) || 0,
      startups_count: Number(context.startups_count) || 0,
    }))
    .filter((candidate) => {
      if (mapping.generic) {
        return candidate.total_businesses > 0;
      }

      return (
        candidate.total_businesses > 0 &&
        candidate.data_quality !== "insufficient" &&
        (candidate.direct_competitors > 0 || candidate.complementary_pois > 0)
      );
    });

  if (!enrichedCandidates.length) {
    return {
      alternatives: [],
      data_quality: "insufficient",
      ...getAlternativeUnavailableMessage(mapping),
    };
  }

  const ranges = {
    total_businesses: buildRange(enrichedCandidates.map((candidate) => candidate.total_businesses)),
    complementary_pois: buildRange(
      enrichedCandidates.map((candidate) => candidate.complementary_pois)
    ),
    population: buildRange(enrichedCandidates.map((candidate) => candidate.population)),
    startups_count: buildRange(enrichedCandidates.map((candidate) => candidate.startups_count)),
    direct_competitors: buildRange(
      enrichedCandidates.map((candidate) => candidate.direct_competitors)
    ),
  };

  const alternatives = enrichedCandidates
    .map((candidate) => {
      const businessDensityNorm = normalizeValue(
        candidate.total_businesses,
        ranges.total_businesses.min,
        ranges.total_businesses.max
      );
      const complementaryPoisNorm = normalizeValue(
        candidate.complementary_pois,
        ranges.complementary_pois.min,
        ranges.complementary_pois.max
      );
      const populationNorm = normalizeValue(
        candidate.population,
        ranges.population.min,
        ranges.population.max
      );
      const startupsNorm = normalizeValue(
        candidate.startups_count,
        ranges.startups_count.min,
        ranges.startups_count.max
      );
      const competitorsNorm = normalizeValue(
        candidate.direct_competitors,
        ranges.direct_competitors.min,
        ranges.direct_competitors.max
      );
      const weightedScore =
        0.35 * complementaryPoisNorm +
        0.25 * businessDensityNorm +
        0.2 * populationNorm +
        0.1 * startupsNorm -
        0.1 * competitorsNorm;
      const confidenceMultiplier =
        candidate.data_quality === "proxy"
          ? 0.85
          : candidate.data_quality === "insufficient"
          ? 0.65
          : mapping.generic
          ? 0.75
          : 1;
      const score = Math.round(
        Math.min(Math.max(weightedScore * confidenceMultiplier, 0), 1) * 100
      );
      const notesAr =
        candidate.data_source_notes_ar ||
        (mapping.generic ? mapping.genericNoteAr : "") ||
        "تم حساب هذا الموقع من بيانات OpenStreetMap المتاحة حول صحار.";
      const notesEn =
        candidate.data_source_notes_en ||
        (mapping.generic ? mapping.genericNoteEn : "") ||
        "This location was calculated from available OpenStreetMap data around Sohar.";
      const explanation_en =
        candidate.data_quality === "proxy"
          ? `This area is suggested as a proxy for ${mapping.labels.en} because exact category data is limited, with ${candidate.total_businesses} nearby business POIs, ${candidate.complementary_pois} complementary services, and ${candidate.direct_competitors} related competitors within 2 km.`
          : `This area is suggested for ${mapping.labels.en} because it has ${candidate.total_businesses} nearby business POIs, ${candidate.complementary_pois} complementary services, and ${candidate.direct_competitors} direct competitors within 2 km.`;
      const explanation_ar =
        candidate.data_quality === "proxy"
          ? `تم اقتراح هذا الموقع كمؤشر تقريبي لفئة ${mapping.labels.ar} بسبب محدودية البيانات الدقيقة، مع ${candidate.total_businesses} نشاطًا تجاريًا قريبًا، و${candidate.complementary_pois} خدمة مكملة، و${candidate.direct_competitors} منافسًا مرتبطًا ضمن 2 كم.`
          : `تم اقتراح هذا الموقع لفئة ${mapping.labels.ar} لأنه يحتوي على ${candidate.total_businesses} نشاطًا تجاريًا قريبًا، و${candidate.complementary_pois} خدمة مكملة، و${candidate.direct_competitors} منافسًا مباشرًا ضمن 2 كم.`;

      return {
        area_name: candidate.area_name,
        governorate: candidate.governorate || context.governorate || "Al Batinah North",
        wilayat: candidate.wilayat || context.wilayat || "Sohar",
        latitude: roundTo(candidate.latitude, 7),
        longitude: roundTo(candidate.longitude, 7),
        score,
        total_businesses: candidate.total_businesses,
        direct_competitors: candidate.direct_competitors,
        competitors: candidate.direct_competitors,
        complementary_pois: candidate.complementary_pois,
        category_confidence: roundTo(candidate.category_confidence, 2),
        data_quality: candidate.data_quality,
        source: candidate.source || "OpenStreetMap POI cluster",
        anchor_poi_name: candidate.anchor_poi_name || null,
        anchor_poi_category: candidate.anchor_poi_category || null,
        anchor_poi_osm_id: candidate.anchor_poi_osm_id ?? null,
        data_source_notes: candidate.data_source_notes || notesEn,
        data_source_notes_ar: notesAr,
        data_source_notes_en: notesEn,
        explanation: explanation_en,
        explanation_ar,
        explanation_en,
      };
    })
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      if (first.direct_competitors !== second.direct_competitors) {
        return first.direct_competitors - second.direct_competitors;
      }

      return String(first.area_name).localeCompare(String(second.area_name));
    });

  return {
    alternatives,
    count: alternatives.length,
    data_quality: allCategoryResolution.data_quality,
    message_ar: alternatives.length ? "" : getAlternativeUnavailableMessage(mapping).message_ar,
    message_en: alternatives.length ? "" : getAlternativeUnavailableMessage(mapping).message_en,
  };
}

function rentalListingMatchesBusiness(listing, businessType = "") {
  const businessKey = normalizeSearchText(businessType);
  const businessWords = String(businessType || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

  return (listing.businessCategories || []).some((category) => {
    const categoryKey = normalizeSearchText(category);
    const categoryText = String(category || "").toLowerCase();

    return (
      categoryKey === businessKey ||
      categoryKey.includes(businessKey) ||
      businessKey.includes(categoryKey) ||
      businessWords.some((word) => categoryText.includes(word))
    );
  });
}

function calculateRentalBudgetFit(monthlyRent, maxMonthlyRent) {
  const rent = Number(monthlyRent);
  const maxRent = Number(maxMonthlyRent);

  if (!Number.isFinite(rent) || rent < 0 || !Number.isFinite(maxRent) || maxRent <= 0) {
    return {
      budgetStatus: "غير مناسب للميزانية",
      budgetStatus_ar: "غير مناسب للميزانية",
      budgetStatus_en: "Not suitable for the budget",
      budgetScore: 0,
    };
  }

  const ratio = rent / maxRent;

  if (ratio <= 1) {
    return {
      budgetStatus: "مناسب للميزانية",
      budgetStatus_ar: "مناسب للميزانية",
      budgetStatus_en: "Suitable for the budget",
      budgetScore: Math.round(Math.max(80, 100 - ratio * 20)),
    };
  }

  if (ratio <= 1.2) {
    return {
      budgetStatus: "أعلى قليلًا من الميزانية",
      budgetStatus_ar: "أعلى قليلًا من الميزانية",
      budgetStatus_en: "Slightly above the budget",
      budgetScore: Math.round(Math.max(60, 80 - ((ratio - 1) / 0.2) * 20)),
    };
  }

  return {
    budgetStatus: "غير مناسب للميزانية",
    budgetStatus_ar: "غير مناسب للميزانية",
    budgetStatus_en: "Not suitable for the budget",
    budgetScore: Math.round(Math.max(0, Math.min(55, (maxRent / rent) * 55))),
  };
}

function getRentalListingCoordinates(listing) {
  const [longitude, latitude] = listing.location?.coordinates || [];

  return {
    latitude: toFiniteNumber(latitude),
    longitude: toFiniteNumber(longitude),
  };
}

function getRentalBudgetSuggestions({ city, businessType, maxMonthlyRent }) {
  const cityKey = normalizeSearchText(city || "Sohar");
  const cityListings = rentalSeedData.filter(
    (listing) => !cityKey || normalizeSearchText(listing.city) === cityKey
  );
  const categoryMatches = cityListings.filter((listing) =>
    rentalListingMatchesBusiness(listing, businessType)
  );
  const sourceListings = categoryMatches.length ? categoryMatches : cityListings;

  return sourceListings
    .map((listing) => {
      const budgetFit = calculateRentalBudgetFit(listing.monthlyRent, maxMonthlyRent);
      const coordinates = getRentalListingCoordinates(listing);

      return {
        title: listing.title,
        city: listing.city,
        neighborhood: listing.neighborhood,
        address: listing.address,
        monthlyRent: listing.monthlyRent,
        sizeSqm: listing.sizeSqm,
        businessCategories: listing.businessCategories || [],
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        budgetStatus: budgetFit.budgetStatus,
        budgetStatus_ar: budgetFit.budgetStatus_ar,
        budgetStatus_en: budgetFit.budgetStatus_en,
        budgetScore: budgetFit.budgetScore,
        data_source: "Prototype rentalSeedData.js",
        warning: "هذه بيانات إيجار أولية وليست أسعارًا رسمية.",
        warning_ar: "هذه بيانات إيجار أولية وليست أسعارًا رسمية.",
        warning_en: "This is prototype rental data, not official pricing.",
      };
    })
    .sort((first, second) => {
      if (second.budgetScore !== first.budgetScore) {
        return second.budgetScore - first.budgetScore;
      }

      return Number(first.monthlyRent || 0) - Number(second.monthlyRent || 0);
    });
}

async function lookupGeoIpify(ipAddress) {
  const apiKey =
    process.env.GEO_IPIFY_API_KEY ||
    process.env.IPIFY_API_KEY ||
    process.env.GEOIPIFY_API_KEY;

  if (!apiKey) {
    return null;
  }

  const searchParams = new URLSearchParams({
    apiKey,
    ipAddress,
  });

  const response = await fetch(
    `https://geo.ipify.org/api/v2/country,city?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("geo.ipify request failed.");
  }

  const payload = await response.json();

  if (!payload?.ip) {
    return null;
  }

  return formatLocationResponse(payload, "geo.ipify");
}

async function lookupFallbackGeoLocation(ipAddress) {
  const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ipAddress)}`);

  if (!response.ok) {
    throw new Error("Fallback geo lookup request failed.");
  }

  const payload = await response.json();

  if (payload.status !== "success") {
    throw new Error(payload.message || "Fallback geo lookup failed.");
  }

  return formatLocationResponse(payload, "ip-api.com");
}

function validateDatabaseConnection(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error:
        "Database connection is not ready. Add a valid MONGO_URI to enable map analysis and saved reports.",
    });
  }

  return next();
}

async function generateGeminiReply(message) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "PUT_YOUR_KEY_HERE") {
    throw new Error("Gemini API key is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const apiError = data?.error?.message || "Gemini request failed.";
    throw new Error(apiError);
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    databaseReady: mongoose.connection.readyState === 1,
  });
});

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({ error: "message is required." });
  }

  try {
    const reply = await generateGeminiReply(message);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat request failed.");

    const statusCode =
      error.message === "Gemini API key is not configured." ? 500 : 502;

    return res.status(statusCode).json({
      error: "Chat request failed.",
    });
  }
});

async function registerUserHandler(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      });
    }

    const existingUser = await UserModel.findOne({ email }).lean();

    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      user: sanitizeUser(user),
      msg: "Added.",
      message: "Account created successfully.",
    });
  } catch (error) {
    console.log(error);

    if (error?.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    return res.status(500).json({ error: "An error occurred" });
  }
}

async function loginHandler(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    return res.status(200).json({
      user: sanitizeUser(user),
      message: "Success.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function logoutHandler(req, res) {
  res.status(200).json({ message: "Logged out successfully" });
}

app.post("/registerUser", validateDatabaseConnection, registerUserHandler);
app.post("/api/auth/register", validateDatabaseConnection, registerUserHandler);
app.post("/login", validateDatabaseConnection, loginHandler);
app.post("/api/auth/login", validateDatabaseConnection, loginHandler);
app.post("/logout", logoutHandler);
app.post("/api/auth/logout", logoutHandler);

app.get("/api/location-service/lookup", async (req, res) => {
  const ipAddress = normalizeIpAddress(
    req.query.ipAddress || req.headers["x-forwarded-for"] || req.socket?.remoteAddress
  );

  if (!ipAddress) {
    return res.status(400).json({ error: "ipAddress is required." });
  }

  try {
    const geoIpifyResponse = await lookupGeoIpify(ipAddress).catch(() => null);
    const locationResponse =
      geoIpifyResponse || (await lookupFallbackGeoLocation(ipAddress));

    if (!locationResponse?.ip) {
      return res.status(502).json({ error: "Location data could not be resolved." });
    }

    return res.status(200).json(locationResponse);
  } catch (error) {
    return res.status(502).json({
      error: error.message || "Location lookup failed.",
    });
  }
});

app.get("/api/location-recommendations", async (req, res) => {
  const city = String(req.query.city || "").trim();
  const businessType = String(req.query.businessType || "Coffee Shop").trim() || "Coffee Shop";
  const mapping = getBusinessCategoryMapping(businessType);

  try {
    const rawFeatures = await readFile(LOCATION_FEATURES_PATH, "utf8");
    const allAreas = JSON.parse(rawFeatures);
    const cityKey = normalizeSearchText(city);
    const filteredAreas = cityKey
      ? allAreas.filter((area) => {
          const areaNameKey = normalizeSearchText(area.area_name);
          const wilayatKey = normalizeSearchText(area.wilayat);

          return areaNameKey === cityKey || wilayatKey === cityKey;
        })
      : allAreas;

    const recommendations = rankLocations(filteredAreas, businessType).map((area) => ({
      area_name: area.area_name,
      governorate: area.governorate,
      wilayat: area.wilayat,
      latitude: area.latitude,
      longitude: area.longitude,
      score: area.score,
      population: area.population,
      total_businesses: area.total_businesses,
      startups_count: area.startups_count,
      competitors: area.competitors,
      ...buildRecommendationExplanations(area, businessType),
    }));

    return res.status(200).json({
      query: {
        city: city || null,
        businessType: mapping.canonicalType,
      },
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(503).json({
        error:
          "Location features are not ready. Run node scripts/buildLocationFeatures.js from postITapp/server first.",
      });
    }

    console.error("Location recommendation request failed:", error.message);
    return res.status(500).json({ error: "Location recommendation request failed." });
  }
});

app.get("/api/location-competitors", async (req, res) => {
  const city = String(req.query.city || "Sohar").trim() || "Sohar";
  const businessType = String(req.query.businessType || "Coffee Shop").trim() || "Coffee Shop";
  const mapping = getBusinessCategoryMapping(businessType);
  const latitude = toFiniteNumber(req.query.lat);
  const longitude = toFiniteNumber(req.query.lng);
  const radiusKm = toFiniteNumber(req.query.radiusKm) || 3;

  if (latitude === null || longitude === null) {
    return res.status(400).json({
      error: "lat and lng query parameters are required.",
    });
  }

  try {
    const pois = await readSoharPois(city);
    const nearbyPois = pois
      .map((poi) => ({
        ...poi,
        name: cleanPoiName(poi.name),
        distanceKm: calculateDistanceKm(latitude, longitude, poi.latitude, poi.longitude),
      }))
      .filter((poi) => poi.distanceKm !== null && poi.distanceKm <= radiusKm)
      .sort((first, second) => first.distanceKm - second.distanceKm);
    const competitorResolution = resolveDirectCompetitorPois(nearbyPois, mapping);
    const competitors = competitorResolution.directPois
      .map((poi) => ({
        name: cleanPoiName(poi.name),
        category: poi.category,
        latitude: poi.latitude,
        longitude: poi.longitude,
        distanceKm: roundTo(poi.distanceKm, 2),
        source: poi.source || "OpenStreetMap",
        osm_type: poi.osm_type || null,
        osm_id: poi.osm_id ?? null,
      }));
    const emptyMessage = getCompetitorUnavailableMessage(mapping);
    const proxyMessage = {
      message_ar: competitorResolution.data_source_notes_ar || "",
      message_en: competitorResolution.data_source_notes_en || "",
    };

    return res.status(200).json({
      city,
      businessType: mapping.canonicalType,
      radiusKm,
      count: competitors.length,
      mapped_categories: mapping.directCategories,
      related_categories: mapping.relatedCategories || [],
      data_quality: competitorResolution.data_quality,
      category_confidence: roundTo(competitorResolution.category_confidence, 2),
      message_ar:
        competitors.length === 0 ? emptyMessage.message_ar : proxyMessage.message_ar,
      message_en:
        competitors.length === 0 ? emptyMessage.message_en : proxyMessage.message_en,
      data_source_notes_ar: competitorResolution.data_source_notes_ar || "",
      data_source_notes_en: competitorResolution.data_source_notes_en || "",
      competitors,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(503).json({
        error:
          "Sohar OSM POIs are not ready. Run node scripts/fetchOsmPois.js from postITapp/server first.",
      });
    }

    console.error("Location competitor request failed:", error.message);
    return res.status(500).json({ error: "Location competitor request failed." });
  }
});

app.get("/api/alternative-locations", async (req, res) => {
  const city = String(req.query.city || "Sohar").trim() || "Sohar";
  const businessType = String(req.query.businessType || "Coffee Shop").trim() || "Coffee Shop";
  const mapping = getBusinessCategoryMapping(businessType);

  try {
    const [rows, pois, features] = await Promise.all([
      readOmanLocationRows(),
      readSoharPois(city),
      readLocationFeatures(),
    ]);
    const soharFeature = getSoharFeature(features);
    const villageCandidates = buildVillageCandidates(rows, city);
    const candidateAreas = villageCandidates.length
      ? villageCandidates
      : buildOsmClusterCandidates(pois, city, businessType);
    const fallbackCandidate =
      candidateAreas.length > 0
        ? candidateAreas
        : [
            {
              area_name: soharFeature.area_name || "Sohar",
              governorate: soharFeature.governorate || "Al Batinah North",
              wilayat: soharFeature.wilayat || "Sohar",
              latitude: Number(soharFeature.latitude) || 24.3500672,
              longitude: Number(soharFeature.longitude) || 56.7133258,
              source: "location_features.json",
            },
          ];
    const scoredAlternatives = scoreAlternativeCandidates(
      fallbackCandidate,
      pois,
      businessType,
      soharFeature
    );
    const alternatives = scoredAlternatives.alternatives.slice(0, 5);

    return res.status(200).json({
      city,
      businessType: mapping.canonicalType,
      count: alternatives.length,
      data_quality: scoredAlternatives.data_quality,
      message_ar: scoredAlternatives.message_ar || "",
      message_en: scoredAlternatives.message_en || "",
      alternatives,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(503).json({
        error:
          "Alternative location data is not ready. Ensure OSM POIs, location features, and oman_locations.csv exist.",
      });
    }

    console.error("Alternative location request failed:", error.message);
    return res.status(500).json({ error: "Alternative location request failed." });
  }
});

app.get("/api/data-sources", async (req, res) => {
  try {
    const [locationFeatures, osmPois] = await Promise.all([
      readLocationFeatures(),
      readSoharPois("Sohar"),
    ]);

    return res.status(200).json({
      locationFeatures: {
        file: RELATIVE_LOCATION_FEATURES_PATH,
        rows: locationFeatures.length,
      },
      osmPois: {
        file: RELATIVE_OSM_POIS_SOHAR_PATH,
        rows: osmPois.length,
        source: "OpenStreetMap / Overpass API",
        note:
          "OSM POIs were fetched from OpenStreetMap using the Overpass API and stored in the processed data folder.",
      },
      rentalData: {
        used: true,
        file: RELATIVE_RENTAL_SEED_DATA_PATH,
        rows: Array.isArray(rentalSeedData) ? rentalSeedData.length : 0,
        source: "rentalSeedData.js",
        status: "prototype/sample rental data, not official",
        note:
          "rentalSeedData.js is used only for optional rental and budget suggestions unless replaced by official rental data.",
      },
    });
  } catch (error) {
    console.error("Data source audit request failed:", error.message);
    return res.status(500).json({ error: "Data source audit request failed." });
  }
});

app.get("/api/rental-budget-suggestions", async (req, res) => {
  const city = String(req.query.city || "Sohar").trim() || "Sohar";
  const businessType = String(req.query.businessType || "Coffee Shop").trim() || "Coffee Shop";
  const maxMonthlyRent = toFiniteNumber(req.query.maxMonthlyRent);
  const startupBudget = toFiniteNumber(req.query.startupBudget);

  if (maxMonthlyRent === null || maxMonthlyRent <= 0) {
    return res.status(400).json({
      error: "maxMonthlyRent must be a positive number.",
    });
  }

  const suggestions = getRentalBudgetSuggestions({
    city,
    businessType,
    maxMonthlyRent,
  });

  return res.status(200).json({
    city,
    businessType,
    maxMonthlyRent,
    startupBudget,
    count: suggestions.length,
    data_source: "Prototype rentalSeedData.js",
    warning: "هذه بيانات إيجار أولية وليست أسعارًا رسمية.",
    warning_ar: "هذه بيانات إيجار أولية وليست أسعارًا رسمية.",
    warning_en: "This is prototype rental data, not official pricing.",
    suggestions,
  });
});

app.post("/api/map-analysis/analyze", async (req, res) => {
  const debugInfo = {
    mongoReadyState: mongoose.connection.readyState,
    mongoConnected: mongoose.connection.readyState === 1,
    googleApiKeyPresent: Boolean(
      process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY
    ),
    payload: req.body,
  };

  console.error("[MapAnalysis] POST /api/map-analysis/analyze received", debugInfo);

  if (mongoose.connection.readyState !== 1) {
    console.error("[MapAnalysis] MongoDB is not connected", debugInfo);
    return res.status(503).json({
      error:
        "Database connection is not ready. Add a valid MONGO_URI to enable map analysis and saved reports.",
    });
  }

  try {
    const input = normalizeAnalysisInput(req.body);
    const analysis = await buildLocationAnalysis({
      input,
      RentalListingModel,
    });

    return res.status(200).json({
      inputs: input,
      analysis,
    });
  } catch (error) {
    console.error("[MapAnalysis] POST /api/map-analysis/analyze failed", {
      ...debugInfo,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/map-analysis/save", validateDatabaseConnection, async (req, res) => {
  try {
    const input = normalizeAnalysisInput(req.body.inputs || req.body);
    const analysisPayload = req.body.analysis;

    if (!analysisPayload) {
      return res.status(400).json({ error: "Analysis payload is required." });
    }

    const savedAnalysis = await MapAnalysisModel.create({
      projectName: input.projectName,
      businessCategory: input.businessCategory,
      customBusinessCategory: input.customBusinessCategory,
      city: input.city,
      targetAudience: input.targetAudience,
      estimatedBudget: input.estimatedBudget,
      maxMonthlyRent: input.maxMonthlyRent,
      searchRadiusKm: input.searchRadiusKm,
      areaName: input.areaName,
      selectedLocation: analysisPayload.selectedLocation,
      competitorSummary: analysisPayload.competitorSummary,
      rentalSummary: analysisPayload.rentalSummary,
      engagementSummary: analysisPayload.engagementSummary,
      accessibilitySummary: analysisPayload.accessibilitySummary,
      scores: analysisPayload.scores,
      locationScore: analysisPayload.locationScore,
      rating: analysisPayload.rating,
      recommendation: analysisPayload.recommendation,
      alternatives: analysisPayload.alternatives,
    });

    return res.status(201).json({
      message: "Analysis saved successfully.",
      id: savedAnalysis._id,
      createdAt: savedAnalysis.createdAt,
    });
  } catch (error) {
    console.error("Saving analysis failed:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  console.log(
    "MongoDB target:",
    hasMongoUri ? redactMongoCredentials(mongoUri) : "missing"
  );

  if (!mongoUri) {
    console.error("MONGO_URI is missing. Add MONGO_URI to server/.env.");
  } else {
    let mongoConnected = false;

    try {
      await mongoose.connect(mongoUri);
      mongoConnected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection failed");
      console.error("MongoDB error name:", error?.name || "unknown");
      console.error("MongoDB error code:", error?.code || "none");
      console.error(
        "MongoDB error message:",
        redactMongoCredentials(error?.message || "unknown")
      );
      console.error(
        "MongoDB possible reason:",
        getMongoConnectionFailureReason(error)
      );
    }

    if (mongoConnected) {
      try {
        await RentalListingModel.syncIndexes();
        await seedRentalListings(RentalListingModel);
      } catch (error) {
        console.error("Rental listing setup failed:", error.message);
      }
    }
  }

  app.listen(PORT, () => {
    console.log(`RiadaTech API is listening on port ${PORT}`);
  });
}

startServer();
