import React from 'react';
import Frame from "./HomePage/Frame";
import Header from "../components/Header";
import SEO from "../components/SEO";

function Home() {
  return (
    <div className="relative">
      <SEO
        title="Массаж и диагностика | КООСМО — Бийск, Новосибирск"
        description="КООСМО — массаж, диагностика по ногтям, языку, глазам, коже и телу, тибетские поющие чаши и онлайн-курсы в Бийске и Новосибирске. Запишитесь на приём или консультацию онлайн."
        keywords="массаж Бийск, массаж Новосибирск, тибетские чаши, диагностика по языку, диагностика по ногтям, диагностика по глазам, диагностика кожи, оздоровительный центр, КООСМО"
        canonical="https://koosmo.ru/"
        ogUrl="https://koosmo.ru/"
        schema={{
          "@type": ["LocalBusiness", "MedicalBusiness"],
          "name": "КООСМО — Оздоровительный центр",
          "alternateName": "КООСМО",
          "url": "https://koosmo.ru",
          "logo": "https://koosmo.ru/logo512.png",
          "image": "https://koosmo.ru/logo512.png",
          "description": "Массаж, диагностика по внешним признакам, тибетские поющие чаши и онлайн-курсы в Бийске и Новосибирске.",
          "priceRange": "₽₽",
          "currenciesAccepted": "RUB",
          "paymentAccepted": "Cash, Card",
          "sameAs": [
            "https://vk.com/koosmo.zdrav.massag",
            "https://t.me/koosmo_zdravmassag"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "Russian"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Услуги центра",
            "itemListElement": [
              {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Массаж", "areaServed": ["Бийск", "Новосибирск"]}},
              {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Тибетские поющие чаши", "areaServed": ["Бийск", "Новосибирск"]}},
              {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Диагностика здоровья", "areaServed": ["Бийск", "Новосибирск"]}},
              {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Онлайн-курсы и консультации"}}
            ]
          }
        }}
      />
      {/* Mobile/tablet header with burger menu - visible below lg but hidden on mobile homepage */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-[100] bg-[#efdec5]">
        <Header />
      </div>
      {/* Spacer for fixed header - only on desktop */}
      <div className="hidden lg:block h-[64px]" />
      <Frame />
    </div>
  );
}

export default Home;