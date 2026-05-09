import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import XLSX from "xlsx";

import {
  ABAYA_NAME_KEYWORDS,
  ALL_TRACKED_OSM_CATEGORIES,
  BUSINESS_OSM_CATEGORIES,
  poiNameMatchesKeywords,
} from "../utils/businessTypeMapping.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_DIR = path.resolve(__dirname, "..");
const RAW_DIR = path.join(SERVER_DIR, "data", "raw");
const PROCESSED_DIR = path.join(SERVER_DIR, "data", "processed");

const RAW_PATHS = {
  locations: path.join(RAW_DIR, "oman_locations.csv"),
  population: path.join(RAW_DIR, "population.xlsx"),
  labourMarket: path.join(RAW_DIR, "labour_market.xlsx"),
  startups: path.join(RAW_DIR, "startups.xlsx"),
  googlePlaces: path.join(RAW_DIR, "google_places.csv"),
};

const OUTPUT_COLUMNS = [
  "area_id",
  "area_name",
  "governorate",
  "wilayat",
  "latitude",
  "longitude",
  "population",
  "workforce",
  "startups_count",
  "total_businesses",
  "business_competitors",
  "cafe_competitors",
  "restaurant_competitors",
  "bakery_competitors",
  "abaya_competitors",
  "clothes_competitors",
  "perfume_competitors",
  "salon_competitors",
  "grocery_competitors",
  "flower_competitors",
  "pharmacy_competitors",
  "bank_competitors",
  "electronics_competitors",
  "complementary_pois",
  "data_source_notes",
];

const GOVERNORATE_ALIASES = new Map([
  ["muscat", "Muscat"],
  ["محافظةمسقط", "Muscat"],
  ["dhofar", "Dhofar"],
  ["ظفار", "Dhofar"],
  ["محافظةظفار", "Dhofar"],
  ["musandam", "Musandam"],
  ["محافظةمسندم", "Musandam"],
  ["alburaimi", "Al Buraymi"],
  ["alburaymi", "Al Buraymi"],
  ["alburaimi", "Al Buraymi"],
  ["محافظةالبريمي", "Al Buraymi"],
  ["aldakhiliyah", "Ad Dakhliyah"],
  ["addakhliyah", "Ad Dakhliyah"],
  ["الدakhليah", "Ad Dakhliyah"],
  ["محافظةالداخلية", "Ad Dakhliyah"],
  ["aldhahirah", "Adh Dhahirah"],
  ["addhahirah", "Adh Dhahirah"],
  ["adhdhahirah", "Adh Dhahirah"],
  ["محافظةالظاهرة", "Adh Dhahirah"],
  ["alwustaa", "Al Wusta"],
  ["alwusta", "Al Wusta"],
  ["محافظةالوسطى", "Al Wusta"],
  ["northbatinah", "Al Batinah North"],
  ["albatinahnorth", "Al Batinah North"],
  ["محافظةشمالالباطنة", "Al Batinah North"],
  ["southbatinah", "Al Batinah South"],
  ["albatinahsouth", "Al Batinah South"],
  ["محافظةجنوبالباطنة", "Al Batinah South"],
  ["northalsharqiya", "Ash Sharqiyah North"],
  ["ashsharqiyahnorth", "Ash Sharqiyah North"],
  ["محافظةشمالالشرقية", "Ash Sharqiyah North"],
  ["southalsharqiya", "Ash Sharqiyah South"],
  ["ashsharqiyahsouth", "Ash Sharqiyah South"],
  ["محافظةجنوبالشرقية", "Ash Sharqiyah South"],
]);

const NOTE_GOVERNORATE_LEVEL =
  "Governorate-level indicator used due to unavailable wilayat-level data.";
const NOTE_WORKFORCE_UNMATCHED =
  "Workforce left null because labour_market.xlsx does not provide matchable wilayat-level workforce.";

function normalizeLookupKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/محافظة/g, "محافظة")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "");
}

function normalizeGovernorateName(value) {
  const key = normalizeLookupKey(value);
  return GOVERNORATE_ALIASES.get(key) || String(value || "").trim();
}

function normalizeWilayatName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function addNote(notes, note) {
  if (note && !notes.includes(note)) {
    notes.push(note);
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

function readWorkbookRows(filePath, preferredSheetName) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames.includes(preferredSheetName)
    ? preferredSheetName
    : workbook.SheetNames.find((name) => name.startsWith("Data -")) || workbook.SheetNames[0];

  if (!sheetName) {
    return [];
  }

  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: null,
  });
}

async function readCsvRows(filePath) {
  const csvText = await readFile(filePath, "utf8");

  return parse(csvText, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

async function readWilayatRows() {
  const rows = await readCsvRows(RAW_PATHS.locations);
  const wilayatMap = new Map();

  for (const row of rows) {
    const wilayat = normalizeWilayatName(row.Wallyat_Name_English);
    const governorate = normalizeGovernorateName(row.Governate_Name_English);
    const latitude = toNumber(row.Wallyat_Latitude);
    const longitude = toNumber(row.Wallyat_Longitude);

    if (!wilayat || latitude === null || longitude === null) {
      continue;
    }

    const key = normalizeLookupKey(`${governorate}:${wilayat}`);

    if (!wilayatMap.has(key)) {
      wilayatMap.set(key, {
        area_id: slugify(`${governorate}_${wilayat}`),
        area_name: wilayat,
        governorate,
        wilayat,
        latitude,
        longitude,
      });
    }
  }

  return Array.from(wilayatMap.values()).sort((first, second) =>
    first.wilayat.localeCompare(second.wilayat)
  );
}

function readPopulationByGovernorate() {
  const rows = readWorkbookRows(RAW_PATHS.population, "Data - Population by Governorat");
  const populationMap = new Map();

  for (const row of rows) {
    const governorate = normalizeGovernorateName(row.Regions);
    const population = toNumber(row["2025"]);

    if (governorate && population !== null) {
      populationMap.set(governorate, population);
    }
  }

  return populationMap;
}

function readStartupsByGovernorate() {
  const rows = readWorkbookRows(RAW_PATHS.startups, "الشركات الناشئة");
  const startupsMap = new Map();

  for (const row of rows) {
    const governorate = normalizeGovernorateName(row["المحافظة"]);

    if (governorate) {
      startupsMap.set(governorate, (startupsMap.get(governorate) || 0) + 1);
    }
  }

  return startupsMap;
}

function readWorkforceByGovernorate() {
  const rows = readWorkbookRows(RAW_PATHS.labourMarket, "Data - number of workers");
  const hasRegionColumn = rows.some((row) => row.Regions);

  if (!hasRegionColumn) {
    return new Map();
  }

  return rows.reduce((workforceMap, row) => {
    const governorate = normalizeGovernorateName(row.Regions);
    const workforce = toNumber(row["2025"]);

    if (governorate && workforce !== null) {
      workforceMap.set(governorate, workforce);
    }

    return workforceMap;
  }, new Map());
}

function haversineDistanceKm(firstPoint, secondPoint) {
  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latDiff = toRadians(secondPoint.latitude - firstPoint.latitude);
  const lngDiff = toRadians(secondPoint.longitude - firstPoint.longitude);
  const firstLat = toRadians(firstPoint.latitude);
  const secondLat = toRadians(secondPoint.latitude);
  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDiff / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function categorizeGooglePlace(types = "") {
  const normalizedTypes = String(types || "").toLowerCase();

  if (normalizedTypes.includes("cafe") || normalizedTypes.includes("coffee")) {
    return "cafe";
  }

  if (
    normalizedTypes.includes("restaurant") ||
    normalizedTypes.includes("fast food") ||
    normalizedTypes.includes("food")
  ) {
    return "restaurant";
  }

  if (normalizedTypes.includes("pharmacy") || normalizedTypes.includes("drugstore")) {
    return "pharmacy";
  }

  if (
    normalizedTypes.includes("supermarket") ||
    normalizedTypes.includes("grocery") ||
    normalizedTypes.includes("convenience")
  ) {
    return "supermarket";
  }

  if (normalizedTypes.includes("bakery")) {
    return "bakery";
  }

  if (
    normalizedTypes.includes("hair") ||
    normalizedTypes.includes("salon") ||
    normalizedTypes.includes("beauty")
  ) {
    return "hairdresser";
  }

  if (normalizedTypes.includes("bank") || normalizedTypes.includes("finance")) {
    return "bank";
  }

  if (normalizedTypes.includes("school") || normalizedTypes.includes("university")) {
    return "school";
  }

  if (normalizedTypes.includes("hospital")) {
    return "hospital";
  }

  if (
    normalizedTypes.includes("clinic") ||
    normalizedTypes.includes("doctor") ||
    normalizedTypes.includes("health")
  ) {
    return "clinic";
  }

  if (normalizedTypes.includes("clothing") || normalizedTypes.includes("clothes")) {
    return "clothes";
  }

  if (normalizedTypes.includes("boutique")) {
    return "boutique";
  }

  if (normalizedTypes.includes("fashion")) {
    return "fashion";
  }

  if (normalizedTypes.includes("perfume") || normalizedTypes.includes("cosmetic")) {
    return "cosmetics";
  }

  if (normalizedTypes.includes("florist") || normalizedTypes.includes("flower")) {
    return "florist";
  }

  if (normalizedTypes.includes("electronics")) {
    return "electronics";
  }

  if (normalizedTypes.includes("mall") || normalizedTypes.includes("shopping_mall")) {
    return "mall";
  }

  return "";
}

async function readGoogleFallbackPois(targetWilayat) {
  const rows = await readCsvRows(RAW_PATHS.googlePlaces);
  const radiusKm = 15;

  return rows
    .filter((row) => {
      const isOman =
        row.timezone === "Asia/Muscat" ||
        String(row.full_address || "").toLowerCase().includes("oman");
      const latitude = toNumber(row.latitude);
      const longitude = toNumber(row.longitude);
      const category = categorizeGooglePlace(row.types);

      if (!isOman || latitude === null || longitude === null || !category) {
        return false;
      }

      return (
        haversineDistanceKm(
          { latitude, longitude },
          { latitude: targetWilayat.latitude, longitude: targetWilayat.longitude }
        ) <= radiusKm
      );
    })
    .map((row) => ({
      name: row.name || "",
      category: categorizeGooglePlace(row.types),
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
      osm_type: "",
      osm_id: row.place_id || "",
      source: "Google Places fallback",
    }));
}

async function readSoharPois(soharWilayat) {
  const osmPath = path.join(PROCESSED_DIR, "osm_pois_sohar.json");

  if (await fileExists(osmPath)) {
    const osmPois = JSON.parse(await readFile(osmPath, "utf8"));
    return {
      pois: Array.isArray(osmPois) ? osmPois : [],
      sourceNote: "OpenStreetMap POIs used as primary source for Sohar.",
    };
  }

  const googleFallbackPois = await readGoogleFallbackPois(soharWilayat);

  return {
    pois: googleFallbackPois,
    sourceNote: "Google Places fallback used because osm_pois_sohar.json was not available.",
  };
}

function summarizePois(pois = []) {
  const categoryCount = (categories) =>
    pois.filter((poi) => categories.includes(String(poi.category || "").toLowerCase())).length;
  const fashionCategories = ["clothes", "boutique", "fashion"];
  const abayaPois = pois.filter(
    (poi) =>
      fashionCategories.includes(String(poi.category || "").toLowerCase()) &&
      poiNameMatchesKeywords(poi, ABAYA_NAME_KEYWORDS)
  );

  return {
    total_businesses: pois.length,
    business_competitors: categoryCount(BUSINESS_OSM_CATEGORIES),
    cafe_competitors: categoryCount(["cafe"]),
    restaurant_competitors: categoryCount(["restaurant", "fast_food"]),
    bakery_competitors: categoryCount(["bakery"]),
    abaya_competitors: abayaPois.length,
    clothes_competitors: categoryCount(fashionCategories),
    perfume_competitors: categoryCount(["perfumery", "cosmetics"]),
    salon_competitors: categoryCount(["hairdresser"]),
    grocery_competitors: categoryCount(["supermarket", "convenience"]),
    flower_competitors: categoryCount(["florist"]),
    pharmacy_competitors: categoryCount(["pharmacy"]),
    bank_competitors: categoryCount(["bank"]),
    electronics_competitors: categoryCount(["electronics"]),
    complementary_pois: categoryCount(ALL_TRACKED_OSM_CATEGORIES),
  };
}

async function buildLocationFeatures() {
  await mkdir(PROCESSED_DIR, { recursive: true });

  const wilayats = await readWilayatRows();
  const populationByGovernorate = readPopulationByGovernorate();
  const startupsByGovernorate = readStartupsByGovernorate();
  const workforceByGovernorate = readWorkforceByGovernorate();
  const soharWilayat = wilayats.find(
    (wilayat) => normalizeLookupKey(wilayat.wilayat) === "sohar"
  );
  const soharPoiData = soharWilayat
    ? await readSoharPois(soharWilayat)
    : { pois: [], sourceNote: "Sohar was not found in oman_locations.csv." };

  return wilayats.map((wilayat) => {
    const notes = [];
    const population = populationByGovernorate.get(wilayat.governorate) ?? null;
    const startupsCount = startupsByGovernorate.get(wilayat.governorate) ?? 0;
    const workforce = workforceByGovernorate.get(wilayat.governorate) ?? null;
    const isSohar = normalizeLookupKey(wilayat.wilayat) === "sohar";
    const poiSummary = isSohar ? summarizePois(soharPoiData.pois) : summarizePois([]);

    if (population !== null || startupsCount > 0) {
      addNote(notes, NOTE_GOVERNORATE_LEVEL);
    }

    if (workforce === null) {
      addNote(notes, NOTE_WORKFORCE_UNMATCHED);
    }

    if (isSohar) {
      addNote(notes, soharPoiData.sourceNote);
    } else {
      addNote(notes, "POI columns prepared for future wilayat-level OSM fetches.");
    }

    return {
      ...wilayat,
      population,
      workforce,
      startups_count: startupsCount,
      ...poiSummary,
      data_source_notes: notes.join(" "),
    };
  });
}

async function main() {
  const features = await buildLocationFeatures();
  const jsonPath = path.join(PROCESSED_DIR, "location_features.json");
  const csvPath = path.join(PROCESSED_DIR, "location_features.csv");

  await writeFile(jsonPath, `${JSON.stringify(features, null, 2)}\n`, "utf8");
  await writeFile(
    csvPath,
    stringify(features, {
      header: true,
      columns: OUTPUT_COLUMNS,
    }),
    "utf8"
  );

  console.log(`Built ${features.length} location feature rows.`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`CSV: ${csvPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
