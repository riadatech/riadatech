export const BUSINESS_OSM_CATEGORIES = [
  "cafe",
  "restaurant",
  "fast_food",
  "bakery",
  "clothes",
  "boutique",
  "fashion",
  "perfumery",
  "cosmetics",
  "hairdresser",
  "supermarket",
  "convenience",
  "florist",
  "pharmacy",
  "bank",
  "electronics",
  "mall",
];

export const SUPPORTING_OSM_CATEGORIES = ["school", "hospital", "clinic"];

export const ALL_TRACKED_OSM_CATEGORIES = [
  ...BUSINESS_OSM_CATEGORIES,
  ...SUPPORTING_OSM_CATEGORIES,
];

export const ABAYA_NAME_KEYWORDS = [
  "abaya",
  "عباية",
  "عبايات",
  "عباياه",
  "جلابية",
  "jilbab",
  "hijab",
];

const PROXY_ABAYA_NOTE_AR =
  "لا توجد بيانات كافية عن متاجر العبايات تحديدًا، وتم استخدام متاجر الملابس القريبة كمؤشر تقريبي.";
const PROXY_ABAYA_NOTE_EN =
  "Specific abaya store data is limited, so nearby clothes stores were used as a proxy indicator.";
const GENERIC_OTHER_NOTE_AR =
  "لم يتم تحديد فئة نشاط دقيقة، لذلك تم استخدام مؤشرات النشاط التجاري العامة.";
const GENERIC_OTHER_NOTE_EN =
  "No precise business category was selected, so generic business activity indicators were used.";

export const BUSINESS_CATEGORY_MAPPINGS = [
  {
    canonicalType: "Coffee Shop",
    labels: { ar: "مقهى", en: "Coffee Shop" },
    matches: ["coffee shop", "coffee", "cafe", "cafeteria", "مقهى"],
    directCategories: ["cafe"],
    complementaryCategories: [
      "restaurant",
      "fast_food",
      "bakery",
      "bank",
      "school",
      "hospital",
      "clinic",
      "supermarket",
      "convenience",
    ],
    competitorField: "cafe_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Restaurant",
    labels: { ar: "مطعم", en: "Restaurant" },
    matches: ["restaurant", "مطعم"],
    directCategories: ["restaurant", "fast_food"],
    complementaryCategories: [
      "cafe",
      "bakery",
      "bank",
      "school",
      "hospital",
      "clinic",
      "supermarket",
    ],
    competitorField: "restaurant_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Bakery",
    labels: { ar: "مخبز", en: "Bakery" },
    matches: ["bakery", "مخبز"],
    directCategories: ["bakery"],
    complementaryCategories: ["cafe", "restaurant", "supermarket", "convenience", "school"],
    competitorField: "bakery_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Abaya Store",
    labels: { ar: "متجر عبايات", en: "Abaya Store" },
    matches: ["abaya store", "abaya", "متجر عبايات", "عباية", "عبايات"],
    directCategories: ["clothes", "boutique", "fashion"],
    relatedCategories: ["clothes", "boutique", "fashion"],
    complementaryCategories: [
      "clothes",
      "cosmetics",
      "perfumery",
      "hairdresser",
      "bank",
      "mall",
      "supermarket",
      "restaurant",
      "cafe",
    ],
    competitorField: "abaya_competitors",
    exactNameKeywords: ABAYA_NAME_KEYWORDS,
    proxyNoteAr: PROXY_ABAYA_NOTE_AR,
    proxyNoteEn: PROXY_ABAYA_NOTE_EN,
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Clothes Store",
    labels: { ar: "متجر ملابس", en: "Clothes Store" },
    matches: ["clothes store", "clothing", "clothes", "fashion", "boutique", "متجر ملابس", "ملابس"],
    directCategories: ["clothes", "boutique", "fashion"],
    complementaryCategories: [
      "cosmetics",
      "perfumery",
      "hairdresser",
      "bank",
      "mall",
      "restaurant",
      "cafe",
    ],
    competitorField: "clothes_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Perfume Store",
    labels: { ar: "متجر عطور", en: "Perfume Store" },
    matches: ["perfume store", "perfume", "perfumery", "cosmetics", "متجر عطور", "عطور"],
    directCategories: ["perfumery", "cosmetics"],
    complementaryCategories: ["clothes", "boutique", "hairdresser", "mall", "bank"],
    competitorField: "perfume_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Salon",
    labels: { ar: "صالون", en: "Salon" },
    matches: ["salon", "hair", "beauty", "hairdresser", "صالون"],
    directCategories: ["hairdresser"],
    complementaryCategories: ["cosmetics", "perfumery", "clothes", "cafe", "bank"],
    competitorField: "salon_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Grocery",
    labels: { ar: "بقالة", en: "Grocery" },
    matches: ["grocery", "grocery store", "supermarket", "convenience", "بقالة"],
    directCategories: ["supermarket", "convenience"],
    complementaryCategories: ["restaurant", "cafe", "school", "hospital", "clinic", "bank"],
    competitorField: "grocery_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Flower Shop",
    labels: { ar: "متجر ورد", en: "Flower Shop" },
    matches: ["flower shop", "flower", "florist", "متجر ورد", "ورد"],
    directCategories: ["florist"],
    complementaryCategories: ["hospital", "clinic", "restaurant", "cafe", "mall", "bank"],
    competitorField: "flower_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Pharmacy",
    labels: { ar: "صيدلية", en: "Pharmacy" },
    matches: ["pharmacy", "chemist", "صيدلية"],
    directCategories: ["pharmacy"],
    complementaryCategories: ["hospital", "clinic", "supermarket", "school", "bank"],
    competitorField: "pharmacy_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Bank",
    labels: { ar: "بنك", en: "Bank" },
    matches: ["bank", "بنك"],
    directCategories: ["bank"],
    complementaryCategories: ["restaurant", "cafe", "supermarket", "clothes", "mall"],
    competitorField: "bank_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
  {
    canonicalType: "Electronics Store",
    labels: { ar: "متجر إلكترونيات", en: "Electronics Store" },
    matches: ["electronics store", "electronics", "متجر إلكترونيات", "إلكترونيات"],
    directCategories: ["electronics"],
    complementaryCategories: ["clothes", "bank", "mall", "supermarket", "cafe"],
    competitorField: "electronics_competitors",
    minimumDirectCount: 1,
    minimumSignalCount: 2,
  },
];

export const OTHER_BUSINESS_MAPPING = {
  canonicalType: "Other",
  labels: { ar: "أخرى", en: "Other" },
  matches: ["other", "أخرى"],
  directCategories: [],
  relatedCategories: [],
  complementaryCategories: BUSINESS_OSM_CATEGORIES,
  competitorField: "business_competitors",
  generic: true,
  minimumDirectCount: 0,
  minimumSignalCount: 2,
  genericNoteAr: GENERIC_OTHER_NOTE_AR,
  genericNoteEn: GENERIC_OTHER_NOTE_EN,
};

export function normalizeBusinessType(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s+/g, " ");
}

export function normalizeOsmCategory(value = "") {
  return String(value || "").trim().toLowerCase();
}

export function getBusinessCategoryMapping(businessType = "") {
  const normalizedType = normalizeBusinessType(businessType);

  if (!normalizedType || normalizedType === "other" || normalizedType === "أخرى") {
    return OTHER_BUSINESS_MAPPING;
  }

  return (
    BUSINESS_CATEGORY_MAPPINGS.find(({ matches }) =>
      matches.some((keyword) => {
        const normalizedKeyword = normalizeBusinessType(keyword);
        return (
          normalizedType === normalizedKeyword ||
          normalizedType.includes(normalizedKeyword)
        );
      })
    ) || OTHER_BUSINESS_MAPPING
  );
}

export const getBusinessTypeMapping = getBusinessCategoryMapping;

export function getOsmCategoriesForBusinessType(businessType = "") {
  return getBusinessCategoryMapping(businessType).directCategories;
}

export function getComplementaryCategoriesForBusinessType(businessType = "") {
  return getBusinessCategoryMapping(businessType).complementaryCategories;
}

export function getCompetitorFieldForBusinessType(businessType = "") {
  return getBusinessCategoryMapping(businessType).competitorField;
}

export function getRelevantAnchorCategories(mappingOrBusinessType = "") {
  const mapping =
    typeof mappingOrBusinessType === "string"
      ? getBusinessCategoryMapping(mappingOrBusinessType)
      : mappingOrBusinessType || OTHER_BUSINESS_MAPPING;

  return Array.from(
    new Set([
      ...(mapping.directCategories || []),
      ...(mapping.relatedCategories || []),
      ...(mapping.complementaryCategories || []),
    ])
  );
}

export function poiMatchesCategories(poi = {}, categories = []) {
  const category = normalizeOsmCategory(poi.category);
  return categories.map(normalizeOsmCategory).includes(category);
}

export function poiNameMatchesKeywords(poi = {}, keywords = []) {
  const name = normalizeBusinessType(poi.name || "");

  if (!name) {
    return false;
  }

  return keywords.some((keyword) => name.includes(normalizeBusinessType(keyword)));
}

export function resolveDirectCompetitorPois(pois = [], mappingOrBusinessType = "") {
  const mapping =
    typeof mappingOrBusinessType === "string"
      ? getBusinessCategoryMapping(mappingOrBusinessType)
      : mappingOrBusinessType || OTHER_BUSINESS_MAPPING;

  if (mapping.generic) {
    return {
      directPois: [],
      relatedPois: [],
      data_quality: "generic",
      category_confidence: 0.35,
      data_source_notes_ar: mapping.genericNoteAr,
      data_source_notes_en: mapping.genericNoteEn,
    };
  }

  if (mapping.exactNameKeywords?.length) {
    const categoryMatchedPois = pois.filter((poi) =>
      poiMatchesCategories(poi, mapping.directCategories)
    );
    const exactPois = categoryMatchedPois.filter((poi) =>
      poiNameMatchesKeywords(poi, mapping.exactNameKeywords)
    );

    if (exactPois.length >= mapping.minimumDirectCount) {
      return {
        directPois: exactPois,
        relatedPois: categoryMatchedPois,
        data_quality: "specific",
        category_confidence: 1,
        data_source_notes_ar: "",
        data_source_notes_en: "",
      };
    }

    const relatedPois = pois.filter((poi) =>
      poiMatchesCategories(poi, mapping.relatedCategories || mapping.directCategories)
    );

    if (relatedPois.length > 0) {
      return {
        directPois: relatedPois,
        relatedPois,
        data_quality: "proxy",
        category_confidence: 0.55,
        data_source_notes_ar: mapping.proxyNoteAr || "",
        data_source_notes_en: mapping.proxyNoteEn || "",
      };
    }

    return {
      directPois: [],
      relatedPois: [],
      data_quality: "insufficient",
      category_confidence: 0,
      data_source_notes_ar: "",
      data_source_notes_en: "",
    };
  }

  const directPois = pois.filter((poi) => poiMatchesCategories(poi, mapping.directCategories));

  if (directPois.length === 0) {
    return {
      directPois: [],
      relatedPois: [],
      data_quality: "insufficient",
      category_confidence: 0,
      data_source_notes_ar: "",
      data_source_notes_en: "",
    };
  }

  return {
    directPois,
    relatedPois: directPois,
    data_quality: "specific",
    category_confidence: directPois.length >= mapping.minimumDirectCount ? 0.95 : 0.75,
    data_source_notes_ar: "",
    data_source_notes_en: "",
  };
}

