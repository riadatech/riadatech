import { getCompetitorFieldForBusinessType } from "./businessTypeMapping.js";

const SCORE_WEIGHTS = {
  population: 0.3,
  totalBusinesses: 0.2,
  startupsCount: 0.15,
  complementaryPois: 0.15,
  competitors: -0.2,
};

const RANGE_FIELDS = [
  "population",
  "total_businesses",
  "startups_count",
  "complementary_pois",
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
];

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getRange(values) {
  const numericValues = values.map(toNumber);

  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
  };
}

function buildRanges(areas) {
  return RANGE_FIELDS.reduce((ranges, field) => {
    ranges[field] = getRange(areas.map((area) => area[field]));
    return ranges;
  }, {});
}

export function normalizeValue(value, min, max) {
  const numericValue = toNumber(value);
  const numericMin = toNumber(min);
  const numericMax = toNumber(max);

  if (numericMax <= numericMin) {
    return numericValue > 0 ? 1 : 0;
  }

  return clamp((numericValue - numericMin) / (numericMax - numericMin), 0, 1);
}

export function calculateLocationScore(area, businessType, ranges) {
  const competitorField = getCompetitorFieldForBusinessType(businessType);
  const scoreRanges = ranges || buildRanges([area]);
  const populationRange = scoreRanges.population || { min: 0, max: 0 };
  const businessRange = scoreRanges.total_businesses || { min: 0, max: 0 };
  const startupRange = scoreRanges.startups_count || { min: 0, max: 0 };
  const complementaryRange = scoreRanges.complementary_pois || { min: 0, max: 0 };
  const competitorRange = scoreRanges[competitorField] || { min: 0, max: 0 };

  const populationNorm = normalizeValue(
    area.population,
    populationRange.min,
    populationRange.max
  );
  const totalBusinessesNorm = normalizeValue(
    area.total_businesses,
    businessRange.min,
    businessRange.max
  );
  const startupsCountNorm = normalizeValue(
    area.startups_count,
    startupRange.min,
    startupRange.max
  );
  const complementaryPoisNorm = normalizeValue(
    area.complementary_pois,
    complementaryRange.min,
    complementaryRange.max
  );
  const competitorsNorm = normalizeValue(
    area[competitorField],
    competitorRange.min,
    competitorRange.max
  );

  const weightedScore =
    SCORE_WEIGHTS.population * populationNorm +
    SCORE_WEIGHTS.totalBusinesses * totalBusinessesNorm +
    SCORE_WEIGHTS.startupsCount * startupsCountNorm +
    SCORE_WEIGHTS.complementaryPois * complementaryPoisNorm +
    SCORE_WEIGHTS.competitors * competitorsNorm;

  return Math.round(clamp(weightedScore, 0, 1) * 100);
}

export function rankLocations(areas, businessType) {
  const safeAreas = Array.isArray(areas) ? areas : [];
  const ranges = buildRanges(safeAreas.length ? safeAreas : [{}]);
  const competitorField = getCompetitorFieldForBusinessType(businessType);

  return safeAreas
    .map((area) => ({
      ...area,
      score: calculateLocationScore(area, businessType, ranges),
      competitors: toNumber(area[competitorField]),
    }))
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return String(first.area_name || "").localeCompare(String(second.area_name || ""));
    });
}
