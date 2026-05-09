import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_DIR = path.resolve(__dirname, "..");
const RAW_DIR = path.join(SERVER_DIR, "data", "raw");
const PROCESSED_DIR = path.join(SERVER_DIR, "data", "processed");
const OMAN_LOCATIONS_PATH = path.join(RAW_DIR, "oman_locations.csv");
const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const DEFAULT_RADIUS_METERS = 10000;

const SOHAR_BBOX = {
  south: 24.25,
  west: 56.6,
  north: 24.5,
  east: 56.9,
};

const AMENITY_CATEGORIES = [
  "cafe",
  "restaurant",
  "fast_food",
  "pharmacy",
  "bank",
  "school",
  "hospital",
  "clinic",
];

const SHOP_CATEGORIES = [
  "supermarket",
  "convenience",
  "bakery",
  "hairdresser",
  "clothes",
  "boutique",
  "fashion",
  "perfumery",
  "cosmetics",
  "florist",
  "electronics",
  "mall",
];

const OUTPUT_COLUMNS = [
  "name",
  "category",
  "latitude",
  "longitude",
  "osm_type",
  "osm_id",
  "source",
];

function parseCliArgs(argv) {
  return argv.reduce(
    (args, value) => {
      if (value === "--all") {
        args.all = true;
        return args;
      }

      if (value.startsWith("--wilayat=")) {
        args.wilayat = value.replace("--wilayat=", "").trim();
      }

      return args;
    },
    { all: false, wilayat: "Sohar" }
  );
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getCategory(tags = {}) {
  if (AMENITY_CATEGORIES.includes(tags.amenity)) {
    return tags.amenity;
  }

  if (SHOP_CATEGORIES.includes(tags.shop)) {
    return tags.shop;
  }

  return "";
}

function buildBboxQuery({ south, west, north, east }) {
  const amenityPattern = AMENITY_CATEGORIES.join("|");
  const shopPattern = SHOP_CATEGORIES.join("|");
  const bbox = `${south},${west},${north},${east}`;

  return `
[out:json][timeout:90];
(
  node["amenity"~"^(${amenityPattern})$"](${bbox});
  way["amenity"~"^(${amenityPattern})$"](${bbox});
  relation["amenity"~"^(${amenityPattern})$"](${bbox});
  node["shop"~"^(${shopPattern})$"](${bbox});
  way["shop"~"^(${shopPattern})$"](${bbox});
  relation["shop"~"^(${shopPattern})$"](${bbox});
);
out center tags;
`;
}

function buildRadiusQuery({ latitude, longitude, radiusMeters }) {
  const amenityPattern = AMENITY_CATEGORIES.join("|");
  const shopPattern = SHOP_CATEGORIES.join("|");

  return `
[out:json][timeout:90];
(
  node["amenity"~"^(${amenityPattern})$"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"~"^(${amenityPattern})$"](around:${radiusMeters},${latitude},${longitude});
  relation["amenity"~"^(${amenityPattern})$"](around:${radiusMeters},${latitude},${longitude});
  node["shop"~"^(${shopPattern})$"](around:${radiusMeters},${latitude},${longitude});
  way["shop"~"^(${shopPattern})$"](around:${radiusMeters},${latitude},${longitude});
  relation["shop"~"^(${shopPattern})$"](around:${radiusMeters},${latitude},${longitude});
);
out center tags;
`;
}

async function readWilayatCenters() {
  const csvText = await readFile(OMAN_LOCATIONS_PATH, "utf8");
  const rows = parse(csvText, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const centers = new Map();

  for (const row of rows) {
    const wilayat = row.Wallyat_Name_English;
    const latitude = toNumber(row.Wallyat_Latitude);
    const longitude = toNumber(row.Wallyat_Longitude);

    if (!wilayat || latitude === null || longitude === null) {
      continue;
    }

    const key = normalizeText(wilayat);

    if (!centers.has(key)) {
      centers.set(key, {
        governorate: row.Governate_Name_English,
        wilayat: wilayat.trim(),
        latitude,
        longitude,
      });
    }
  }

  return Array.from(centers.values()).sort((first, second) =>
    first.wilayat.localeCompare(second.wilayat)
  );
}

async function requestOverpass(query) {
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "User-Agent": "RiadaTech data pipeline",
    },
    body: new URLSearchParams({ data: query }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Overpass API failed with status ${response.status}.`);
  }

  return response.json();
}

function normalizePois(elements = []) {
  const seen = new Set();

  return elements
    .map((element) => {
      const latitude = toNumber(element.lat ?? element.center?.lat);
      const longitude = toNumber(element.lon ?? element.center?.lon);
      const category = getCategory(element.tags);
      const key = `${element.type}:${element.id}`;

      if (!category || latitude === null || longitude === null || seen.has(key)) {
        return null;
      }

      seen.add(key);

      return {
        name: element.tags?.name || "",
        category,
        latitude,
        longitude,
        osm_type: element.type,
        osm_id: element.id,
        source: "OpenStreetMap",
      };
    })
    .filter(Boolean)
    .sort((first, second) => {
      if (first.category !== second.category) {
        return first.category.localeCompare(second.category);
      }

      return String(first.name || "").localeCompare(String(second.name || ""));
    });
}

async function writePoiOutputs(wilayat, pois) {
  await mkdir(PROCESSED_DIR, { recursive: true });

  const slug = slugify(wilayat);
  const jsonPath = path.join(PROCESSED_DIR, `osm_pois_${slug}.json`);
  const csvPath = path.join(PROCESSED_DIR, `osm_pois_${slug}.csv`);

  await writeFile(jsonPath, `${JSON.stringify(pois, null, 2)}\n`, "utf8");
  await writeFile(
    csvPath,
    stringify(pois, {
      header: true,
      columns: OUTPUT_COLUMNS,
    }),
    "utf8"
  );

  return { jsonPath, csvPath };
}

export async function fetchPoisForWilayat(wilayatInfo, options = {}) {
  const wilayat = wilayatInfo.wilayat || "Sohar";
  const isSohar = normalizeText(wilayat) === "sohar";
  const query = isSohar
    ? buildBboxQuery(SOHAR_BBOX)
    : buildRadiusQuery({
        latitude: wilayatInfo.latitude,
        longitude: wilayatInfo.longitude,
        radiusMeters: options.radiusMeters || DEFAULT_RADIUS_METERS,
      });

  const payload = await requestOverpass(query);
  const pois = normalizePois(payload.elements);
  const output = await writePoiOutputs(wilayat, pois);

  return {
    wilayat,
    count: pois.length,
    ...output,
  };
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const wilayatCenters = await readWilayatCenters();

  if (args.all) {
    const results = [];

    for (const center of wilayatCenters) {
      console.log(`Fetching OSM POIs for ${center.wilayat}...`);
      results.push(await fetchPoisForWilayat(center));
      await delay(2000);
    }

    console.log(`Fetched OSM POIs for ${results.length} wilayats.`);
    return;
  }

  const requestedWilayat = normalizeText(args.wilayat || "Sohar");
  const center =
    wilayatCenters.find((item) => normalizeText(item.wilayat) === requestedWilayat) || {
      wilayat: args.wilayat || "Sohar",
      latitude: 24.3500672,
      longitude: 56.7133258,
    };

  const result = await fetchPoisForWilayat(center);
  console.log(`Fetched ${result.count} OSM POIs for ${result.wilayat}.`);
  console.log(`JSON: ${result.jsonPath}`);
  console.log(`CSV: ${result.csvPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
