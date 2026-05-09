export const cityCoordinates = {
  Muscat: { lat: 23.588, lng: 58.3829 },
  Sohar: { lat: 24.3476, lng: 56.7093 },
  Salalah: { lat: 17.0194, lng: 54.0897 },
  Nizwa: { lat: 22.9333, lng: 57.5333 },
  Sur: { lat: 22.5667, lng: 59.5289 },
  Barka: { lat: 23.7028, lng: 57.8853 },
  Rustaq: { lat: 23.3908, lng: 57.4244 },
  Ibri: { lat: 23.2257, lng: 56.5157 },
};

export const businessCategoryOptions = [
  { value: "Coffee Shop", ar: "مقهى", en: "Coffee Shop" },
  { value: "Restaurant", ar: "مطعم", en: "Restaurant" },
  { value: "Bakery", ar: "مخبز", en: "Bakery" },
  { value: "Abaya Store", ar: "متجر عبايات", en: "Abaya Store" },
  { value: "Clothes Store", ar: "متجر ملابس", en: "Clothes Store" },
  { value: "Perfume Store", ar: "متجر عطور", en: "Perfume Store" },
  { value: "Salon", ar: "صالون", en: "Salon" },
  { value: "Grocery", ar: "بقالة", en: "Grocery" },
  { value: "Flower Shop", ar: "متجر ورد", en: "Flower Shop" },
  { value: "Pharmacy", ar: "صيدلية", en: "Pharmacy" },
  { value: "Bank", ar: "بنك", en: "Bank" },
  { value: "Electronics Store", ar: "متجر إلكترونيات", en: "Electronics Store" },
  { value: "Other", ar: "أخرى", en: "Other" },
];

export const targetAudienceOptions = [
  { value: "Students", ar: "الطلاب", en: "Students" },
  { value: "Families", ar: "العائلات", en: "Families" },
  { value: "Tourists", ar: "السياح", en: "Tourists" },
  { value: "Office Workers", ar: "موظفو المكاتب", en: "Office Workers" },
  { value: "General Public", ar: "الجمهور العام", en: "General Public" },
];

export const cityOptions = [
  { value: "Muscat", ar: "مسقط", en: "Muscat" },
  { value: "Sohar", ar: "صحار", en: "Sohar" },
  { value: "Salalah", ar: "صلالة", en: "Salalah" },
  { value: "Nizwa", ar: "نزوى", en: "Nizwa" },
  { value: "Sur", ar: "صور", en: "Sur" },
  { value: "Barka", ar: "بركاء", en: "Barka" },
  { value: "Rustaq", ar: "الرستاق", en: "Rustaq" },
  { value: "Ibri", ar: "عبري", en: "Ibri" },
];

export const uiText = {
  ar: {
    badge: "تحليل مواقع الأعمال المدعوم بالذكاء",
    titleLineOne: "اختر موقع مشروعك",
    titleAccent: "بثقة ووضوح",
    description:
      "حلل بيانات السكان، النشاط التجاري، الشركات الناشئة، والمنافسة لاختيار موقع مناسب لمشروعك في عُمان.",
    statOneTitle: "خرائط Google",
    statOneText: "اختر الموقع، حرّك العلامة، وحدد نطاق البحث مباشرة.",
    statTwoTitle: "بيانات السوق",
    statTwoText: "اعرض مؤشرات النشاط التجاري والمنافسة حول الموقع المحدد.",
    statThreeTitle: "نموذج تقييم",
    statThreeText: "نتيجة واضحة تساعدك على مقارنة المواقع عند توفر بيانات إضافية.",
    heroCardBadge: "موجز الموقع الذكي",
    heroCardTitle: "عرض واحد يجمع السوق والموقع",
    heroCardText:
      "تعرض الواجهة توصية مبنية على بيانات السكان، النشاط التجاري، الشركات الناشئة، والمنافسة لمساعدة رائد الأعمال على اتخاذ قرار أفضل.",
    startButton: "ابدأ التحليل",
    saveButton: "حفظ التحليل",
    savedMessage: "تم حفظ التحليل بنجاح في قاعدة البيانات.",
    formTitle: "بيانات المشروع",
    formDescription:
      "أدخل معلومات المشروع ثم اختر المدينة أو الموقع على الخريطة للحصول على توصية مبنية على البيانات.",
    projectName: "اسم المشروع",
    businessCategory: "فئة النشاط",
    customCategory: "حدد النشاط",
    city: "المدينة",
    audience: "الجمهور المستهدف",
    estimatedBudget: "الميزانية التقديرية",
    maxRent: "الحد الأقصى للإيجار الشهري",
    radius: "نطاق البحث",
    areaName: "اسم المنطقة أو الحي",
    searchLocation: "ابحث عن موقع أو حي داخل عُمان",
    mapTitle: "الخريطة التفاعلية",
    mapDescription:
      "ابحث عن موقع، انقر على الخريطة، أو حرّك العلامة لتحديث منطقة التحليل.",
    mapHint:
      "يمكنك تحديد الموقع عبر البحث أو النقر المباشر على الخريطة. سيتم تحديث العلامة والدائرة تلقائيًا.",
    mapKeyMissing:
      "أضف REACT_APP_GOOGLE_MAPS_API_KEY لتفعيل الخريطة التفاعلية وميزة البحث بالموقع.",
    analysisLoading: "جاري تحليل الموقع وبناء التوصية...",
    analysisError:
      "تعذر إكمال التحليل. تأكد من تشغيل الخادم وإعداد قاعدة البيانات والمفاتيح.",
    chooseLocationError: "اختر موقعًا على الخريطة قبل بدء التحليل.",
    selectedLocation: "الموقع المحدد",
    resultsTitle: "نتائج تحليل الموقع",
    resultsDescription:
      "ملخص النتيجة والتوصية المبنية على بيانات السكان، النشاط التجاري، الشركات الناشئة، والمنافسة.",
    nearbyCompetitors: "عدد المنافسين",
    rentalAvailability: "خيارات الإيجار",
    rentSuitability: "درجة الإيجار",
    activityLevel: "درجة النشاط",
    accessibility: "درجة الوصول",
    finalScore: "ملخص النتيجة",
    recommendationTitle: "موقع موصى به",
    recommendationSubtitle:
      "تم حساب النتيجة بناءً على بيانات السكان، النشاط التجاري، الشركات الناشئة، والمنافسة.",
    competitionSummary: "ملخص المنافسة",
    rentalSummary: "خيارات إيجار مقترحة",
    activitySummary: "ملخص النشاط",
    accessibilitySummary: "ملخص الوصول",
    scoreBreakdown: "المؤشرات",
    alternativeLocations: "المواقع البديلة المقترحة",
    competitorsTable: "تفاصيل المنافسين",
    rentalsTable: "أفضل خيارات الإيجار",
    competitorName: "اسم المنافس",
    placeName: "الموقع",
    distance: "المسافة",
    rent: "الإيجار",
    size: "المساحة",
    level: "المستوى",
    score: "النتيجة",
    createdAt: "تاريخ التحليل",
    scoreCompetition: "درجة المنافسة",
    scoreRent: "درجة الإيجار",
    scoreEngagement: "درجة النشاط",
    scoreAccessibility: "درجة الوصول",
    markerSelected: "موقع المشروع",
    markerCompetitor: "منافسون",
    markerRental: "خيارات إيجار",
    noResults: "لا توجد نتائج بعد. ابدأ التحليل لعرض التوصية.",
  },
  en: {
    badge: "AI-powered business location analysis",
    titleLineOne: "Choose your next",
    titleAccent: "business location",
    description:
      "Analyze population, business activity, startups, and competition to choose a stronger business location in Oman.",
    statOneTitle: "Google Maps",
    statOneText: "Search the place, move the pin, and draw the exact radius.",
    statTwoTitle: "Market data",
    statTwoText: "Review business activity and competition signals around the selected location.",
    statThreeTitle: "Scoring model",
    statThreeText: "A clear score for comparing locations as more data becomes available.",
    heroCardBadge: "AI Location Brief",
    heroCardTitle: "One view for market and site fit",
    heroCardText:
      "The dashboard presents a recommendation based on population, business activity, startups, and competition data to support better business decisions.",
    startButton: "Run analysis",
    saveButton: "Save analysis",
    savedMessage: "Analysis saved successfully in MongoDB.",
    formTitle: "Project inputs",
    formDescription:
      "Enter the business details, then choose a city or map point to get a data-driven recommendation.",
    projectName: "Project name",
    businessCategory: "Business category",
    customCategory: "Custom category",
    city: "City",
    audience: "Target audience",
    estimatedBudget: "Estimated budget",
    maxRent: "Maximum monthly rent",
    radius: "Search radius",
    areaName: "Optional area / neighborhood",
    searchLocation: "Search for a place or neighborhood in Oman",
    mapTitle: "Interactive map",
    mapDescription:
      "Search for a place, click on the map, or drag the marker to refresh the analysis area.",
    mapHint:
      "Select the location through search or direct click. The marker and radius circle update automatically.",
    mapKeyMissing:
      "Add REACT_APP_GOOGLE_MAPS_API_KEY to enable the interactive map and place search.",
    analysisLoading: "Analyzing the location and preparing the recommendation...",
    analysisError:
      "Analysis could not be completed. Verify the backend server, MongoDB, and API keys.",
    chooseLocationError: "Choose a location on the map before running the analysis.",
    selectedLocation: "Selected location",
    resultsTitle: "Location analysis results",
    resultsDescription:
      "A compact summary of the recommendation based on population, business activity, startups, and competition.",
    nearbyCompetitors: "Competitors",
    rentalAvailability: "Rental options",
    rentSuitability: "Rent score",
    activityLevel: "Activity score",
    accessibility: "Accessibility score",
    finalScore: "Result summary",
    recommendationTitle: "Recommended location",
    recommendationSubtitle:
      "The score is calculated from population, business activity, startups, and competition data.",
    competitionSummary: "Competition summary",
    rentalSummary: "Suggested rental options",
    activitySummary: "Activity summary",
    accessibilitySummary: "Accessibility summary",
    scoreBreakdown: "Indicators",
    alternativeLocations: "Suggested alternative locations",
    competitorsTable: "Competitor details",
    rentalsTable: "Best rental options",
    competitorName: "Competitor",
    placeName: "Location",
    distance: "Distance",
    rent: "Rent",
    size: "Size",
    level: "Level",
    score: "Score",
    createdAt: "Analysis date",
    scoreCompetition: "Competition score",
    scoreRent: "Rent score",
    scoreEngagement: "Activity score",
    scoreAccessibility: "Accessibility score",
    markerSelected: "Selected business location",
    markerCompetitor: "Competitors",
    markerRental: "Rental options",
    noResults: "No results yet. Run the analysis to show the recommendation.",
  },
};

export function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (!apiKey) {
      reject(new Error("Google Maps API key is missing."));
      return;
    }

    if (window.google?.maps?.places) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.getElementById("rt-google-maps-script");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google.maps));
      existingScript.addEventListener("error", () =>
        reject(new Error("Google Maps failed to load."))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "rt-google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Google Maps failed to load."));
    document.head.appendChild(script);
  });
}
