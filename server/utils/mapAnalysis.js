import rentalSeedData from "../data/rentalSeedData.js";

const cityCenters = {
  Muscat: { lat: 23.588, lng: 58.3829 },
  Sohar: { lat: 24.3476, lng: 56.7093 },
  Salalah: { lat: 17.0194, lng: 54.0897 },
  Nizwa: { lat: 22.9333, lng: 57.5333 },
  Sur: { lat: 22.5667, lng: 59.5289 },
  Barka: { lat: 23.7028, lng: 57.8853 },
  Rustaq: { lat: 23.3908, lng: 57.4244 },
  Ibri: { lat: 23.2257, lng: 56.5157 },
};

const categoryKeywords = {
  "Coffee Shop": "coffee shop cafe",
  Restaurant: "restaurant dining",
  Bakery: "bakery pastry",
  "Abaya Store": "abaya boutique",
  "Perfume Shop": "perfume store",
  Salon: "beauty salon",
  "Grocery Store": "grocery supermarket",
  "Flower Shop": "flower shop florist",
  Pharmacy: "pharmacy",
  Boutique: "boutique fashion",
  "Electronics Store": "electronics store",
};

const ratingThresholds = [
  { min: 85, label: "Excellent" },
  { min: 70, label: "Good" },
  { min: 50, label: "Fair" },
  { min: 0, label: "Weak" },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, digits = 1) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(pointA, pointB) {
  const earthRadiusKm = 6371;
  const latDiff = toRadians(pointB.lat - pointA.lat);
  const lngDiff = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(latDiff / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDiff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function getCompetitionLevel(count) {
  if (count <= 4) {
    return "Low";
  }

  if (count <= 9) {
    return "Medium";
  }

  return "High";
}

function getActivityLevel(count) {
  if (count <= 10) {
    return "Low activity";
  }

  if (count <= 24) {
    return "Medium activity";
  }

  return "High activity";
}

function getAccessibilityLevel(score) {
  if (score >= 75) {
    return "High";
  }

  if (score >= 50) {
    return "Medium";
  }

  return "Low";
}

function getRating(score) {
  return ratingThresholds.find((threshold) => score >= threshold.min)?.label ?? "Weak";
}

function getRentSuitabilityLabel(bestRentScore) {
  if (bestRentScore >= 85) {
    return "Excellent fit";
  }

  if (bestRentScore >= 70) {
    return "Good fit";
  }

  if (bestRentScore >= 50) {
    return "Fair fit";
  }

  return "Challenging";
}

function scoreRentAgainstBudget(monthlyRent, maxMonthlyRent) {
  if (!maxMonthlyRent) {
    return 45;
  }

  const differenceRatio = Math.abs(monthlyRent - maxMonthlyRent) / maxMonthlyRent;
  const closenessScore = clamp(100 - differenceRatio * 100, 0, 100);
  const affordabilityBoost = monthlyRent <= maxMonthlyRent ? 8 : -12;

  return clamp(round(closenessScore + affordabilityBoost, 0), 0, 100);
}

function createRecommendation({
  businessLabel,
  competitionLevel,
  rentalLabel,
  activityLevel,
  accessibilityLevel,
  rating,
}) {
  return `This location is a ${rating.toLowerCase()} choice for ${businessLabel} because the competition is ${competitionLevel.toLowerCase()}, the rent fit is ${rentalLabel.toLowerCase()}, the area activity is ${activityLevel.toLowerCase()}, and accessibility is ${accessibilityLevel.toLowerCase()}.`;
}

function buildAlternativeReason({
  monthlyRent,
  maxMonthlyRent,
  competitionLevel,
  activityLevel,
  businessLabel,
}) {
  const rentStatus =
    monthlyRent <= maxMonthlyRent ? "rent stays within budget" : "rent needs a tighter budget";

  return `Strong option for ${businessLabel} because ${rentStatus}, competition is ${competitionLevel.toLowerCase()}, and area activity is ${activityLevel.toLowerCase()}.`;
}

function formatPlaceItem(place, selectedLocation) {
  const lat = place.geometry?.location?.lat;
  const lng = place.geometry?.location?.lng;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return {
    name: place.name,
    address: place.vicinity || place.formatted_address || "",
    distanceKm: round(haversineDistanceKm(selectedLocation, { lat, lng })),
    lat,
    lng,
  };
}

function createMockCompetitors(input) {
  const baseLocation = input.location;
  const businessLabel = input.businessCategoryLabel;

  return [
    {
      name: `${businessLabel} Hub`,
      address: `${input.city} Commercial Street`,
      distanceKm: 0.8,
      lat: baseLocation.lat + 0.004,
      lng: baseLocation.lng + 0.003,
    },
    {
      name: `${businessLabel} Express`,
      address: `${input.city} Main Road`,
      distanceKm: 1.6,
      lat: baseLocation.lat - 0.005,
      lng: baseLocation.lng + 0.006,
    },
    {
      name: `${businessLabel} Corner`,
      address: `${input.city} Neighborhood Center`,
      distanceKm: 2.2,
      lat: baseLocation.lat + 0.008,
      lng: baseLocation.lng - 0.004,
    },
  ];
}

async function fetchGooglePlaces({ location, radiusMeters, keyword, type }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return [];
  }

  const searchParams = new URLSearchParams({
    key: apiKey,
    location: `${location.lat},${location.lng}`,
    radius: String(Math.min(radiusMeters, 50000)),
  });

  if (keyword) {
    searchParams.set("keyword", keyword);
  }

  if (type) {
    searchParams.set("type", type);
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Unable to reach Google Places API.");
  }

  const payload = await response.json();

  if (payload.status === "ZERO_RESULTS") {
    return [];
  }

  if (payload.status !== "OK") {
    throw new Error(payload.error_message || payload.status || "Google Places search failed.");
  }

  return payload.results;
}

async function fetchNearbyCompetitors(input, radiusMeters) {
  const keyword =
    input.businessCategory === "Other"
      ? input.customBusinessCategory || "business"
      : categoryKeywords[input.businessCategory] || input.businessCategory;

  try {
    const results = await fetchGooglePlaces({
      location: input.location,
      radiusMeters,
      keyword,
    });

    const formatted = results
      .map((place) => formatPlaceItem(place, input.location))
      .filter(Boolean)
      .sort((first, second) => first.distanceKm - second.distanceKm)
      .slice(0, 12);

    if (formatted.length > 0) {
      return formatted;
    }
  } catch (error) {
    console.error("Competitor search error:", error.message);
  }

  return createMockCompetitors(input);
}

async function fetchAmenitySignals(location, radiusMeters) {
  const amenityTypes = ["shopping_mall", "school", "bank", "transit_station"];

  try {
    const results = await Promise.all(
      amenityTypes.map((type) =>
        fetchGooglePlaces({
          location,
          radiusMeters,
          type,
        })
      )
    );

    const uniquePlaces = new Map();
    results.flat().forEach((place) => {
      const placeKey = place.place_id || place.name;
      uniquePlaces.set(placeKey, place);
    });

    return {
      totalDensity: uniquePlaces.size,
      highlights: Array.from(uniquePlaces.values())
        .slice(0, 4)
        .map((place) => place.name)
        .filter(Boolean),
    };
  } catch (error) {
    console.error("Amenity signal error:", error.message);
    return {
      totalDensity: 12,
      highlights: ["Retail cluster", "Daily services", "Transit access"],
    };
  }
}

function normalizeLocation(location, city) {
  const fallbackLocation = cityCenters[city] || cityCenters.Muscat;

  return {
    lat: Number(location?.lat ?? fallbackLocation.lat),
    lng: Number(location?.lng ?? fallbackLocation.lng),
    label: location?.label || city,
  };
}

export function normalizeAnalysisInput(payload = {}) {
  const businessCategory =
    payload.businessCategory && payload.businessCategory.trim()
      ? payload.businessCategory.trim()
      : "Coffee Shop";
  const city = payload.city && payload.city.trim() ? payload.city.trim() : "Muscat";
  const location = normalizeLocation(payload.location, city);

  return {
    projectName: payload.projectName?.trim() || "RiadaTech Opportunity Scan",
    businessCategory,
    businessCategoryLabel:
      businessCategory === "Other" && payload.customBusinessCategory?.trim()
        ? payload.customBusinessCategory.trim()
        : businessCategory,
    customBusinessCategory: payload.customBusinessCategory?.trim() || "",
    city,
    targetAudience: payload.targetAudience?.trim() || "General Public",
    estimatedBudget: Number(payload.estimatedBudget || 0),
    maxMonthlyRent: Number(payload.maxMonthlyRent || 0),
    searchRadiusKm: Number(payload.searchRadiusKm || 3),
    areaName: payload.areaName?.trim() || "",
    location,
  };
}

export async function seedRentalListings(RentalListingModel) {
  const listingsCount = await RentalListingModel.estimatedDocumentCount();

  if (listingsCount > 0) {
    return;
  }

  await RentalListingModel.insertMany(rentalSeedData);
}

export async function buildLocationAnalysis({ input, RentalListingModel }) {
  const radiusMeters = clamp(input.searchRadiusKm * 1000, 500, 15000);
  const competitors = await fetchNearbyCompetitors(input, radiusMeters);
  const amenitySignals = await fetchAmenitySignals(input.location, radiusMeters);

  const rentals = await RentalListingModel.find({
    isAvailable: true,
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [input.location.lng, input.location.lat],
        },
        $maxDistance: radiusMeters,
      },
    },
  })
    .limit(8)
    .lean();

  const sameCityFallbackRentals =
    rentals.length >= 3
      ? []
      : await RentalListingModel.find({
          isAvailable: true,
          city: input.city,
        })
          .limit(6)
          .lean();

  const mergedRentalMap = new Map();

  [...rentals, ...sameCityFallbackRentals].forEach((listing) => {
    mergedRentalMap.set(String(listing._id), listing);
  });

  const formattedRentals = Array.from(mergedRentalMap.values())
    .map((listing) => {
      const [lng, lat] = listing.location.coordinates;
      return {
        id: String(listing._id),
        name: listing.title,
        address: listing.address,
        monthlyRent: listing.monthlyRent,
        sizeSqm: listing.sizeSqm,
        neighborhood: listing.neighborhood,
        city: listing.city,
        lat,
        lng,
        distanceKm: round(haversineDistanceKm(input.location, { lat, lng })),
        rentScore: scoreRentAgainstBudget(listing.monthlyRent, input.maxMonthlyRent),
      };
    })
    .sort((first, second) => first.distanceKm - second.distanceKm);

  const competitionScore = clamp(100 - competitors.length * 9, 20, 100);
  const withinBudgetRentals = formattedRentals.filter(
    (listing) => listing.monthlyRent <= input.maxMonthlyRent
  );
  const bestRentScore = formattedRentals.length
    ? Math.max(...formattedRentals.map((listing) => listing.rentScore))
    : 35;
  const rentScore = clamp(bestRentScore, 25, 100);
  const engagementScore = clamp(40 + amenitySignals.totalDensity * 2.2, 30, 100);
  const cityCenter = cityCenters[input.city] || input.location;
  const distanceToCityCenter = haversineDistanceKm(input.location, cityCenter);
  const centralityScore = clamp(100 - distanceToCityCenter * 7, 35, 100);
  const accessibilityScore = clamp(
    round(centralityScore * 0.5 + engagementScore * 0.35 + competitors.length * 1.5),
    25,
    100
  );

  const locationScore = round(
    competitionScore * 0.35 +
      rentScore * 0.3 +
      engagementScore * 0.2 +
      accessibilityScore * 0.15,
    0
  );

  const competitionLevel = getCompetitionLevel(competitors.length);
  const activityLevel = getActivityLevel(amenitySignals.totalDensity + competitors.length);
  const accessibilityLevel = getAccessibilityLevel(accessibilityScore);
  const rating = getRating(locationScore);
  const rentSuitabilityLabel = getRentSuitabilityLabel(bestRentScore);
  const businessLabel = input.businessCategoryLabel;
  const recommendation = createRecommendation({
    businessLabel,
    competitionLevel,
    rentalLabel: rentSuitabilityLabel,
    activityLevel,
    accessibilityLevel,
    rating,
  });

  const alternatives = formattedRentals
    .slice(0, 6)
    .map((listing, index) => {
      const alternativeCompetitionScore = clamp(
        competitionScore + clamp(listing.distanceKm * 4, 0, 12) - index * 2,
        20,
        100
      );
      const alternativeEngagement = clamp(
        engagementScore - clamp(listing.distanceKm * 3, 0, 15) + 6,
        30,
        100
      );
      const alternativeAccessibility = clamp(
        accessibilityScore + 4 - clamp(listing.distanceKm * 2, 0, 12),
        25,
        100
      );
      const score = round(
        alternativeCompetitionScore * 0.35 +
          listing.rentScore * 0.3 +
          alternativeEngagement * 0.2 +
          alternativeAccessibility * 0.15,
        0
      );
      const level = getCompetitionLevel(Math.max(1, competitors.length - index));

      return {
        name: listing.neighborhood || listing.name,
        address: listing.address,
        monthlyRent: listing.monthlyRent,
        sizeSqm: listing.sizeSqm,
        distanceKm: listing.distanceKm,
        score,
        level,
        lat: listing.lat,
        lng: listing.lng,
        reason: buildAlternativeReason({
          monthlyRent: listing.monthlyRent,
          maxMonthlyRent: input.maxMonthlyRent,
          competitionLevel: level,
          activityLevel,
          businessLabel,
        }),
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, 3);

  return {
    selectedLocation: {
      lat: input.location.lat,
      lng: input.location.lng,
      label: input.location.label,
      city: input.city,
      areaName: input.areaName,
    },
    competitorSummary: {
      count: competitors.length,
      level: competitionLevel,
      items: competitors,
    },
    rentalSummary: {
      totalAvailable: formattedRentals.length,
      withinBudget: withinBudgetRentals.length,
      suitabilityLabel: rentSuitabilityLabel,
      bestOptions: formattedRentals.slice(0, 4),
    },
    engagementSummary: {
      level: activityLevel,
      score: round(engagementScore, 0),
      densityCount: amenitySignals.totalDensity,
      highlights: amenitySignals.highlights,
    },
    accessibilitySummary: {
      level: accessibilityLevel,
      score: round(accessibilityScore, 0),
      highlights: [
        `${round(distanceToCityCenter, 1)} km from city center`,
        `${amenitySignals.totalDensity} nearby service anchors`,
        `${competitors.length} business signals in range`,
      ],
    },
    scores: {
      competition: round(competitionScore, 0),
      rent: round(rentScore, 0),
      engagement: round(engagementScore, 0),
      accessibility: round(accessibilityScore, 0),
    },
    locationScore,
    rating,
    recommendation,
    alternatives,
    generatedAt: new Date().toISOString(),
  };
}
