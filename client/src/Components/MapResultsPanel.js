import React from "react";
import { Sparkles } from "lucide-react";

import ResultAccordionSection from "./ResultAccordionSection";

const RESULT_COPY = {
  ar: {
    locationAnalysisResults: "نتائج تحليل الموقع",
    resultSummary: "ملخص النتيجة",
    recommendedLocation: "موقع موصى به",
    alternativeLocations: "المواقع البديلة المقترحة",
    directCompetitors: "المنافسون القريبون",
    location: "الموقع",
    governorate: "المحافظة",
    wilayat: "الولاية",
    score: "النتيجة",
    population: "السكان",
    totalBusinesses: "عدد الأنشطة التجارية",
    startupsCount: "عدد الشركات الناشئة",
    competitors: "عدد المنافسين",
    complementaryPois: "الخدمات المكملة",
    scoreBreakdown: "المؤشرات",
    recommendationBasis:
      "تم حساب النتيجة بناءً على بيانات السكان، النشاط التجاري، الشركات الناشئة، والمنافسة.",
    alternativeDescription:
      "مواقع بديلة داخل صحار مبنية على بيانات OpenStreetMap ونقاط النشاط القريبة.",
    noAlternatives:
      "لا توجد مواقع بديلة موثوقة حاليًا لهذه الفئة بسبب نقص البيانات.",
    competitorDescription:
      "منافسون مباشرون من OpenStreetMap ضمن نطاق البحث المحدد.",
    noCompetitors: "لا توجد بيانات كافية حاليًا لهذه الفئة.",
    rentalOptions: "تحليل الميزانية والإيجار",
    analysisDate: "تاريخ التحليل",
    category: "الفئة",
    distance: "المسافة",
    source: "المصدر",
    osmId: "معرف OSM",
    anchorPoi: "نقطة الارتكاز",
    dataSourceNotes: "ملاحظات مصدر البيانات",
    dataQuality: "جودة البيانات",
    categoryConfidence: "ثقة الفئة",
    maxMonthlyRent: "أقصى إيجار شهري",
    suggestedRent: "الإيجار المقترح",
    budgetStatus: "حالة الميزانية",
    budgetScore: "درجة ملاءمة الميزانية",
    prototypeRentalWarning:
      "تنبيه: بيانات الإيجار تجريبية وليست أسعارًا رسمية.",
    excellent: "ممتاز",
    good: "جيد",
    average: "متوسط",
    weak: "ضعيف",
    unnamedCompetitor: "منافس بدون اسم",
  },
  en: {
    locationAnalysisResults: "Location Analysis Results",
    resultSummary: "Result Summary",
    recommendedLocation: "Recommended Location",
    alternativeLocations: "Suggested Alternative Locations",
    directCompetitors: "Nearby Competitors",
    location: "Location",
    governorate: "Governorate",
    wilayat: "Wilayat",
    score: "Score",
    population: "Population",
    totalBusinesses: "Business Activities",
    startupsCount: "Startups",
    competitors: "Competitors",
    complementaryPois: "Complementary Services",
    scoreBreakdown: "Indicators",
    recommendationBasis:
      "The score is calculated from population, business activity, startups, complementary POIs, and competition.",
    alternativeDescription:
      "Alternative Sohar locations based on OpenStreetMap POIs and nearby category signals.",
    noAlternatives:
      "No reliable alternative locations are available for this category due to limited data.",
    competitorDescription:
      "Direct competitors from OpenStreetMap within the selected radius.",
    noCompetitors: "Not enough data is currently available for this category.",
    rentalOptions: "Budget and Rent Analysis",
    analysisDate: "Analysis date",
    category: "Category",
    distance: "Distance",
    source: "Source",
    osmId: "OSM ID",
    anchorPoi: "Anchor POI",
    dataSourceNotes: "Data source notes",
    dataQuality: "Data quality",
    categoryConfidence: "Category confidence",
    maxMonthlyRent: "Maximum monthly rent",
    suggestedRent: "Suggested rent",
    budgetStatus: "Budget status",
    budgetScore: "Budget fit score",
    prototypeRentalWarning:
      "Warning: rental data is prototype/sample data and not official pricing.",
    excellent: "Excellent",
    good: "Good",
    average: "Average",
    weak: "Weak",
    unnamedCompetitor: "Unnamed competitor",
  },
};

const CATEGORY_LABELS = {
  ar: {
    cafe: "مقهى",
    restaurant: "مطعم",
    fast_food: "وجبات سريعة",
    bakery: "مخبز",
    clothes: "ملابس",
    boutique: "بوتيك",
    fashion: "أزياء",
    perfumery: "عطور",
    cosmetics: "مستحضرات تجميل",
    hairdresser: "صالون",
    supermarket: "سوبرماركت",
    convenience: "بقالة",
    florist: "متجر ورد",
    pharmacy: "صيدلية",
    bank: "بنك",
    electronics: "إلكترونيات",
    mall: "مركز تجاري",
    school: "مدرسة",
    hospital: "مستشفى",
    clinic: "عيادة",
  },
  en: {},
};

const DATA_QUALITY_LABELS = {
  ar: {
    specific: "بيانات مباشرة",
    proxy: "مؤشر تقريبي",
    insufficient: "بيانات غير كافية",
    generic: "مؤشر عام",
  },
  en: {
    specific: "Direct data",
    proxy: "Proxy indicator",
    insufficient: "Insufficient data",
    generic: "Generic indicator",
  },
};

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDistance(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "--";
  }

  return `${numericValue.toFixed(2)} km`;
}

function getRatingLabel(score, labels) {
  if (score >= 80) {
    return labels.excellent;
  }

  if (score >= 70) {
    return labels.good;
  }

  if (score >= 50) {
    return labels.average;
  }

  return labels.weak;
}

function getPrimaryRecommendation(analysisResult) {
  if (analysisResult.source !== "location-recommendations") {
    return null;
  }

  return (
    analysisResult.locationRecommendation ||
    analysisResult.locationRecommendations?.[0] ||
    null
  );
}

function getScoreValue(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
}

function formatScore(value) {
  return `${getScoreValue(value)} / 100`;
}

function getLocalizedField(item, field, locale, fallback = "") {
  if (!item) {
    return fallback;
  }

  return item[`${field}_${locale}`] || item[field] || fallback;
}

function getCategoryLabel(category, locale) {
  return CATEGORY_LABELS[locale]?.[category] || category || "--";
}

function getDataQualityLabel(value, locale) {
  return DATA_QUALITY_LABELS[locale]?.[value] || value || "--";
}

function getBudgetStatus(item, locale) {
  if (locale === "ar") {
    return item.budgetStatus_ar || item.budgetStatus || "--";
  }

  return item.budgetStatus_en || "--";
}

function MapResultsPanel({
  analysisResult,
  locale,
  text,
  openSections,
  toggleSection,
  formatDate,
  formatCurrency,
  getScoreTone,
}) {
  if (!analysisResult) {
    return <div className="rt-map-status-banner">{text.noResults}</div>;
  }

  const labels = RESULT_COPY[locale] || RESULT_COPY.en;
  const primaryRecommendation = getPrimaryRecommendation(analysisResult);

  if (!primaryRecommendation) {
    return <div className="rt-map-status-banner">{labels.noAlternatives}</div>;
  }

  const alternatives = Array.isArray(analysisResult.alternatives)
    ? analysisResult.alternatives
    : [];
  const competitors = analysisResult.competitorSummary?.items || [];
  const score = getScoreValue(primaryRecommendation.score);
  const rentalSuggestions = analysisResult.rentalBudgetSuggestions || [];
  const maxMonthlyRent = analysisResult.rentalBudgetQuery?.maxMonthlyRent;
  const explanation = getLocalizedField(
    primaryRecommendation,
    "explanation",
    locale,
    labels.recommendationBasis
  );
  const competitorMessage = getLocalizedField(
    analysisResult.competitorQuery,
    "message",
    locale,
    labels.noCompetitors
  );
  const alternativeMessage = getLocalizedField(
    analysisResult.alternativeQuery,
    "message",
    locale,
    labels.noAlternatives
  );
  const rentalWarning =
    locale === "ar"
      ? analysisResult.rentalBudgetQuery?.warning_ar ||
        analysisResult.rentalBudgetQuery?.warning ||
        labels.prototypeRentalWarning
      : analysisResult.rentalBudgetQuery?.warning_en || labels.prototypeRentalWarning;

  return (
    <>
      <div className="rt-map-results-topline rt-map-results-topline-compact rt-map-glow-panel">
        <div className="rt-map-results-topline-copy">
          <span className="rt-map-badge rt-map-badge-inline">
            <Sparkles size={14} />
            {labels.recommendedLocation}
          </span>
          <h3>{labels.resultSummary}</h3>
          <p>{explanation}</p>
        </div>
        <div className={`rt-map-score-pill ${getScoreTone(score)}`}>
          <span>{labels.score}</span>
          <strong>{formatScore(score)}</strong>
          <p>{getRatingLabel(score, labels)}</p>
        </div>
      </div>

      <div className="rt-map-accordion-stack">
        <ResultAccordionSection
          sectionKey="overview"
          title={labels.recommendedLocation}
          description={labels.recommendationBasis}
          badge={formatScore(score)}
          isOpen={openSections.overview}
          onToggle={toggleSection}
        >
          <div className="rt-map-result-card rt-map-spectrum-card rt-map-spectrum-cyan">
            <h3>{labels.resultSummary}</h3>
            <p>{labels.location}: {primaryRecommendation.area_name}</p>
            <p>{labels.governorate}: {primaryRecommendation.governorate}</p>
            <p>{labels.wilayat}: {primaryRecommendation.wilayat}</p>
            <p>{labels.score}: {formatScore(score)}</p>
            <p>{labels.population}: {formatNumber(primaryRecommendation.population)}</p>
            <p>{labels.totalBusinesses}: {formatNumber(primaryRecommendation.total_businesses)}</p>
            <p>{labels.startupsCount}: {formatNumber(primaryRecommendation.startups_count)}</p>
            <p>{labels.competitors}: {formatNumber(primaryRecommendation.competitors)}</p>
            <p>{labels.resultSummary}: {explanation}</p>
          </div>
        </ResultAccordionSection>

        <ResultAccordionSection
          sectionKey="scores"
          title={labels.scoreBreakdown}
          description={labels.recommendationBasis}
          badge={formatScore(score)}
          isOpen={openSections.scores}
          onToggle={toggleSection}
        >
          <div className="rt-map-score-grid">
            <div className="rt-map-score-card rt-map-spectrum-card rt-map-spectrum-green">
              <span>{labels.population}</span>
              <strong>{formatNumber(primaryRecommendation.population)}</strong>
              <p>{primaryRecommendation.governorate}</p>
            </div>
            <div className="rt-map-score-card rt-map-spectrum-card rt-map-spectrum-cyan">
              <span>{labels.totalBusinesses}</span>
              <strong>{formatNumber(primaryRecommendation.total_businesses)}</strong>
              <p>{primaryRecommendation.area_name}</p>
            </div>
            <div className="rt-map-score-card rt-map-spectrum-card rt-map-spectrum-blue">
              <span>{labels.startupsCount}</span>
              <strong>{formatNumber(primaryRecommendation.startups_count)}</strong>
              <p>{primaryRecommendation.wilayat}</p>
            </div>
            <div className="rt-map-score-card rt-map-spectrum-card rt-map-spectrum-red">
              <span>{labels.competitors}</span>
              <strong>{formatNumber(primaryRecommendation.competitors)}</strong>
              <p>{getRatingLabel(score, labels)}</p>
            </div>
          </div>
        </ResultAccordionSection>

        <ResultAccordionSection
          sectionKey="competitors"
          title={labels.directCompetitors}
          description={competitors.length ? labels.competitorDescription : competitorMessage}
          badge={String(competitors.length)}
          isOpen={openSections.competitors}
          onToggle={toggleSection}
        >
          {competitors.length > 0 ? (
            <>
              {competitorMessage ? (
                <div className="rt-map-status-banner">{competitorMessage}</div>
              ) : null}
              <div className="rt-map-data-table">
                <table>
                  <thead>
                    <tr>
                      <th>{labels.location}</th>
                      <th>{labels.category}</th>
                      <th>{labels.distance}</th>
                      <th>{labels.source}</th>
                      <th>{labels.osmId}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((item) => (
                      <tr key={`${item.osm_type || "poi"}-${item.osm_id || item.name}`}>
                        <td>{item.name || labels.unnamedCompetitor}</td>
                        <td>{getCategoryLabel(item.category, locale)}</td>
                        <td>{formatDistance(item.distanceKm)}</td>
                        <td>{item.source || "OpenStreetMap"}</td>
                        <td>{item.osm_id || "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rt-map-status-banner">{competitorMessage}</div>
          )}
        </ResultAccordionSection>

        <ResultAccordionSection
          sectionKey="alternatives"
          title={labels.alternativeLocations}
          description={alternatives.length ? labels.alternativeDescription : alternativeMessage}
          badge={String(alternatives.length)}
          isOpen={openSections.alternatives}
          onToggle={toggleSection}
        >
          {alternatives.length > 0 ? (
            <div className="rt-map-alternatives-grid">
              {alternatives.map((item) => {
                const itemExplanation = getLocalizedField(item, "explanation", locale, "");
                const itemNotes = getLocalizedField(item, "data_source_notes", locale, "");

                return (
                  <div
                    className="rt-map-alt-card rt-map-spectrum-card rt-map-spectrum-auto"
                    key={`${item.area_name}-${item.latitude}-${item.longitude}`}
                  >
                    <h3>{item.area_name}</h3>
                    <p>{item.governorate} - {item.wilayat}</p>
                    <p>
                      {labels.score}: <strong>{formatScore(item.score)}</strong>
                    </p>
                    <p>
                      {labels.totalBusinesses}:{" "}
                      <strong>{formatNumber(item.total_businesses)}</strong>
                    </p>
                    <p>
                      {labels.competitors}:{" "}
                      <strong>{formatNumber(item.direct_competitors ?? item.competitors)}</strong>
                    </p>
                    <p>
                      {labels.complementaryPois}:{" "}
                      <strong>{formatNumber(item.complementary_pois)}</strong>
                    </p>
                    <p>
                      {labels.dataQuality}: {getDataQualityLabel(item.data_quality, locale)}
                    </p>
                    {Number.isFinite(Number(item.category_confidence)) ? (
                      <p>
                        {labels.categoryConfidence}:{" "}
                        {Math.round(Number(item.category_confidence) * 100)}%
                      </p>
                    ) : null}
                    <p>{labels.source}: {item.source || "OpenStreetMap"}</p>
                    {item.anchor_poi_name ? (
                      <p>
                        {labels.anchorPoi}: {item.anchor_poi_name}
                        {item.anchor_poi_category
                          ? ` - ${getCategoryLabel(item.anchor_poi_category, locale)}`
                          : ""}
                        {item.anchor_poi_osm_id
                          ? ` (${labels.osmId}: ${item.anchor_poi_osm_id})`
                          : ""}
                      </p>
                    ) : null}
                    {itemNotes ? (
                      <p>{labels.dataSourceNotes}: {itemNotes}</p>
                    ) : null}
                    {itemExplanation ? <p>{itemExplanation}</p> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rt-map-status-banner">{alternativeMessage}</div>
          )}
        </ResultAccordionSection>

        {rentalSuggestions.length > 0 ? (
          <ResultAccordionSection
            sectionKey="rentals"
            title={labels.rentalOptions}
            description={rentalWarning}
            badge={String(rentalSuggestions.length)}
            isOpen={openSections.rentals}
            onToggle={toggleSection}
          >
            <div className="rt-map-status-banner">{rentalWarning}</div>
            <div className="rt-map-data-table">
              <table>
                <thead>
                  <tr>
                    <th>{labels.location}</th>
                    <th>{labels.maxMonthlyRent}</th>
                    <th>{labels.suggestedRent}</th>
                    <th>{labels.budgetStatus}</th>
                    <th>{labels.budgetScore}</th>
                    <th>{text.size}</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalSuggestions.map((item) => (
                    <tr key={`${item.title}-${item.latitude}-${item.longitude}`}>
                      <td>{item.title}</td>
                      <td>{formatCurrency(maxMonthlyRent)}</td>
                      <td>{formatCurrency(item.monthlyRent)}</td>
                      <td>{getBudgetStatus(item, locale)}</td>
                      <td>{formatScore(item.budgetScore)}</td>
                      <td>{item.sizeSqm ? `${item.sizeSqm} sqm` : "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultAccordionSection>
        ) : null}

        <div className="rt-map-status-banner">
          {labels.analysisDate}: {formatDate(analysisResult.generatedAt)}
        </div>
      </div>
    </>
  );
}

export default MapResultsPanel;
