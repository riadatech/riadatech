import React, { useState } from "react";
import { ArrowUpRight, Landmark } from "lucide-react";
import SiteFooter from "./SiteFooter.jsx";
import "./Funding.css";

const fundingSources = [
  {
    id: "sme-authority",
    ar: "هيئة تنمية المؤسسات الصغيرة والمتوسطة",
    en: "Small and Medium Enterprises Development Authority",
    url: "https://www.sme.gov.om/investment-opportunity-platforms",
    details: {
      ar: {
        funding:
          "منصات وفرص دعم وتمكين وربط مع فرص استثمارية مناسبة للمشاريع الصغيرة والمتوسطة.",
        audience: "رواد الأعمال وأصحاب المؤسسات الصغيرة والمتوسطة.",
        terms: [
          "تختلف الشروط حسب المبادرة أو البرنامج المعلن.",
          "الاطلاع على متطلبات كل فرصة داخل المنصة قبل التقديم.",
        ],
      },
      en: {
        funding:
          "Support, enablement, and access to relevant investment opportunity channels for SMEs.",
        audience: "Entrepreneurs and SME owners.",
        terms: [
          "Requirements depend on the announced initiative or program.",
          "Review each opportunity's criteria before applying.",
        ],
      },
    },
  },
  {
    id: "oman-development-bank",
    ar: "بنك التنمية العماني",
    en: "Oman Development Bank",
    url: "https://db.om/loan-request-form",
    details: {
      ar: {
        funding:
          "حتى 250,000 ريال عماني لبعض برامج التمويل، وقد تصل بعض المسارات إلى 500,000 ريال عماني حسب نوع المشروع والبرنامج.",
        audience: "المشاريع الجديدة والقائمة في القطاعات المؤهلة.",
        terms: [
          "تقديم الطلب عبر نموذج البنك.",
          "استيفاء المتطلبات المالية والائتمانية.",
          "تقديم دراسة أو وصف واضح للمشروع عند الحاجة.",
        ],
      },
      en: {
        funding:
          "Up to OMR 250,000 for some financing tracks, and some programs may reach OMR 500,000 depending on the project type.",
        audience: "New and existing projects in eligible sectors.",
        terms: [
          "Submit the request through the bank form.",
          "Meet financial and credit requirements.",
          "Provide a clear project profile when requested.",
        ],
      },
    },
  },
  {
    id: "mociip",
    ar: "وزارة التجارة والصناعة وترويج الاستثمار",
    en: "Ministry of Commerce, Industry and Investment Promotion",
    url: "https://gov.om/%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA-%D8%A7%D9%84%D8%AD%D9%83%D9%88%D9%85%D9%8A%D8%A9?service=391064",
    details: {
      ar: {
        funding:
          "الخدمة مرتبطة بإجراءات استثمارية وتنظيمية ولا تعرض مبلغ تمويل مباشر ثابت داخل الرابط الحكومي.",
        audience: "المستثمرون وأصحاب المنشآت.",
        terms: [
          "الالتزام بمتطلبات الخدمة الحكومية المختارة.",
          "تجهيز بيانات المنشأة أو الطلب حسب نوع الخدمة.",
        ],
      },
      en: {
        funding:
          "This link provides government investment and service procedures rather than a fixed direct funding amount.",
        audience: "Investors and business owners.",
        terms: [
          "Subject to the selected government service requirements.",
          "Prepare the relevant business or application details.",
        ],
      },
    },
  },
  {
    id: "inma",
    ar: "صندوق تنمية المؤسسات الصغيرة والمتوسطة (إنماء)",
    en: "SME Development Fund (Inma)",
    url: "https://omanstartuphub.om/ar/%D9%86%D8%A8%D8%B0%D8%A9-%D8%B9%D9%86%D8%A7#join-us",
    details: {
      ar: {
        funding:
          "من 5,000 إلى 250,000 ريال عماني حسب البرنامج ومرحلة المشروع، بالإضافة إلى مسارات دعم وتمكين غير مالية.",
        audience: "رواد الأعمال والشركات الناشئة.",
        terms: [
          "التقديم عبر البرامج المتاحة.",
          "استيفاء معايير القبول الخاصة بكل مسار.",
          "ملاءمة فكرة المشروع أو نموّه لمتطلبات البرنامج.",
        ],
      },
      en: {
        funding:
          "From OMR 5,000 to OMR 250,000 depending on the program and business stage, plus non-financial support tracks.",
        audience: "Entrepreneurs and startups.",
        terms: [
          "Apply through the available programs.",
          "Meet the eligibility criteria for each track.",
          "Ensure project fit with the selected program.",
        ],
      },
    },
  },
  {
    id: "nbo",
    ar: "البنك الوطني العماني",
    en: "National Bank of Oman",
    url: "https://www.nbo.om/ar/Pages/Corporate-Banking/Investment-Banking.aspx",
    details: {
      ar: {
        funding:
          "حلول استثمارية ومصرفية للشركات، وتختلف مبالغ التمويل أو هيكلة الاستثمار حسب حجم الصفقة واحتياج المنشأة.",
        audience: "الشركات والمؤسسات الباحثة عن خدمات استثمارية.",
        terms: [
          "تقييم مصرفي حسب طبيعة المشروع.",
          "وجود ملف مالي وتجاري مناسب.",
          "قد تختلف الآلية بين تمويل واستشارات وهيكلة استثمارية.",
        ],
      },
      en: {
        funding:
          "Corporate banking and investment solutions, with funding or deal size depending on the business need and transaction scope.",
        audience: "Businesses seeking investment banking services.",
        terms: [
          "Bank assessment based on project profile.",
          "Appropriate financial and business documentation.",
          "The model may vary between financing and advisory solutions.",
        ],
      },
    },
  },
  {
    id: "oia",
    ar: "جهاز الاستثمار العماني",
    en: "Oman Investment Authority",
    url: "https://oia.gov.om/",
    details: {
      ar: {
        funding:
          "فرص استثمار وشراكات ومبادرات على مستوى أوسع، ولا يوجد مبلغ تمويل ثابت موحد منشور لكل الحالات داخل الموقع الرئيسي.",
        audience: "المستثمرون والمشاريع ذات الطابع الاستراتيجي.",
        terms: [
          "تخضع لطبيعة الفرصة أو الشراكة المطروحة.",
          "الملاءمة الاستراتيجية للمشروع أو القطاع.",
        ],
      },
      en: {
        funding:
          "Investment initiatives and partnership opportunities without a single fixed public amount for every case on the main site.",
        audience: "Investors and strategically aligned projects.",
        terms: [
          "Depends on the specific opportunity or partnership track.",
          "Requires strategic fit with the project or sector.",
        ],
      },
    },
  },
];

const fundingImages = {
  "sme-authority":
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
  "oman-development-bank":
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
  mociip:
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  inma:
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
  nbo:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  oia:
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
};

const getFundingImage = (source) =>
  fundingImages[source.id] || fundingImages["sme-authority"];

function Funding({ locale = "ar" }) {
  const [flippedId, setFlippedId] = useState(null);
  const isArabic = locale === "ar";
  const handleCardClick = (sourceId) => {
    if (window.matchMedia("(hover: none)").matches) {
      setFlippedId(flippedId === sourceId ? null : sourceId);
    }
  };

  const text = isArabic
    ? {
        title: "جهات التمويل والدعم",
        subtitle:
          "مجموعة مختارة من الجهات الرسمية والمالية في عُمان التي يمكن أن تساعدك في تمويل مشروعك أو الانطلاق بخطوات أوضح.",
        cta: "زيارة الجهة",
        badge: "التمويل",
        funding: "مبالغ التمويل",
        audience: "الفئة المستهدفة",
        terms: "الشروط",
      }
    : {
        title: "Funding and Support Entities",
        subtitle:
          "A curated set of official and financial entities in Oman that can help you fund your project and move forward with more clarity.",
        cta: "Visit website",
        badge: "Funding",
        funding: "Funding Amounts",
        audience: "Target Audience",
        terms: "Requirements",
      };

  return (
    <div className="rt-funding-page" dir={isArabic ? "rtl" : "ltr"}>
      <main className="rt-funding-main">
        <section className="rt-funding-shell">
          <div className="rt-funding-hero">
            <span className="rt-funding-badge">
              <Landmark size={16} />
              <span>{text.badge}</span>
            </span>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          <div className="rt-funding-scroll">
            {fundingSources.map((source, index) => (
              <article
                key={source.id}
                className={`rt-funding-card${index === 0 ? " is-featured" : ""}${
                  flippedId === source.id ? " is-flipped" : ""
                }`}
                onClick={() => handleCardClick(source.id)}
              >
                <div className="rt-funding-card-inner">
                  <div className="rt-funding-card-front">
                    <img src={getFundingImage(source)} alt={source[locale]} />

                    <div className="rt-funding-card-title">
                      <h3>{source[locale]}</h3>
                    </div>
                  </div>

                  <div className="rt-funding-card-back">
                    <div className="rt-funding-back-content">
                      <div>
                        <span>{text.funding}</span>
                        <p>{source.details[locale].funding}</p>
                      </div>
                      <div>
                        <span>{text.audience}</span>
                        <p>{source.details[locale].audience}</p>
                      </div>
                      <div>
                        <span>{text.terms}</span>
                        <ul>
                          {source.details[locale].terms.slice(0, 2).map((term) => (
                            <li key={term}>{term}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <a
                      className="rt-funding-link"
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{text.cta}</span>
                      <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}

export default Funding;

