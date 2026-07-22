import React from 'react';
import { Outlet, useLocation, matchPath } from "react-router-dom";
import SEO from "../components/SEO";

interface RouteSeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical: string;
  ogUrl: string;
  schema?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_SEO: RouteSeoConfig = {
  title: "Массаж и диагностика | КООСМО — Бийск, Новосибирск",
  description: "КООСМО — массаж, диагностика по ногтям, языку, глазам, коже и телу, тибетские поющие чаши и онлайн-курсы в Бийске и Новосибирске. Запишитесь на приём или консультацию онлайн.",
  keywords: "массаж Бийск, массаж Новосибирск, тибетские чаши, диагностика по языку, диагностика по ногтям, диагностика по глазам, диагностика кожи, оздоровительный центр, КООСМО",
  canonical: "https://koosmo.ru",
  ogUrl: "https://koosmo.ru",
};

const BASE_SCHEMAS = {
  localBusiness: {
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
    "sameAs": ["https://vk.com/koosmo.zdrav.massag", "https://t.me/koosmo_zdravmassag"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "Russian" }
  },
};

const ROUTE_SEO: Record<string, RouteSeoConfig> = {
  "/": {
    ...DEFAULT_SEO,
    schema: BASE_SCHEMAS.localBusiness,
  },
  "/about": {
    title: "О студии КООСМО — массаж, диагностика, оздоровление",
    description: "Узнайте о студии КООСМО в Бийске и Новосибирске: профессиональный массаж, диагностика по внешним признакам, тибетские поющие чаши и онлайн-курсы.",
    keywords: "о студии КООСМО, массаж Бийск, массаж Новосибирск, оздоровительный центр, диагностика здоровья",
    canonical: "https://koosmo.ru/about",
    ogUrl: "https://koosmo.ru/about",
  },
  "/reviews": {
    title: "Отзывы клиентов — массаж и диагностика | КООСМО Бийск, Новосибирск",
    description: "Читайте отзывы клиентов КООСМО о массаже, диагностике и тибетских поющих чашах в Бийске и Новосибирске. Делитесь своим опытом.",
    keywords: "отзывы массаж Бийск, отзывы массаж Новосибирск, отзывы КООСМО, диагностика отзывы",
    canonical: "https://koosmo.ru/reviews",
    ogUrl: "https://koosmo.ru/reviews",
    schema: {
      "@type": "WebPage",
      "name": "Отзывы клиентов КООСМО",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "reviewCount": "120"
      }
    },
  },
  "/shop": {
    title: "Магазин товаров для здоровья и красоты | КООСМО",
    description: "Магазин КООСМО: товары для здоровья, красоты, ароматерапии, SPA-рецепты, видео-курсы и БАДы с доставкой по России.",
    keywords: "магазин здоровья, ароматерапия, SPA товары, видео курсы массаж, БАДы, КООСМО",
    canonical: "https://koosmo.ru/shop",
    ogUrl: "https://koosmo.ru/shop",
  },
  "/schedule": {
    title: "Запись на массаж в Бийске и Новосибирске | КООСМО",
    description: "Запишитесь на массаж в студии КООСМО. Выберите удобное время онлайн: классический, оздоровительный, расслабляющий массаж в Бийске и Новосибирске.",
    keywords: "запись на массаж Бийск, запись на массаж Новосибирск, массаж онлайн запись, КООСМО",
    canonical: "https://koosmo.ru/schedule",
    ogUrl: "https://koosmo.ru/schedule",
  },
  "/tibetan-bowls": {
    title: "Тибетские поющие чаши — массаж и терапия | Бийск, Новосибирск",
    description: "Сеансы тибетских поющих чаш в Бийске и Новосибирске: глубокое расслабление, снятие стресса и восстановление жизненных сил. Запишитесь онлайн.",
    keywords: "тибетские поющие чаши Бийск, тибетские чаши Новосибирск, звуковая терапия, виброакустический массаж, КООСМО",
    canonical: "https://koosmo.ru/tibetan-bowls",
    ogUrl: "https://koosmo.ru/tibetan-bowls",
    schema: {
      "@type": "Service",
      "name": "Тибетские поющие чаши",
      "description": "Сеансы звуковой терапии и виброакустического массажа тибетскими поющими чашами.",
      "areaServed": ["Бийск", "Новосибирск"],
      "provider": { "@type": "Organization", "name": "КООСМО" }
    },
  },
  "/tibetan-bowls/booking": {
    title: "Запись на тибетские чаши | КООСМО Бийск, Новосибирск",
    description: "Запишитесь на сеанс тибетских поющих чаш в Бийске и Новосибирске. Выберите удобное время онлайн.",
    keywords: "запись тибетские чаши Бийск, запись тибетские чаши Новосибирск, звуковая терапия запись",
    canonical: "https://koosmo.ru/tibetan-bowls/booking",
    ogUrl: "https://koosmo.ru/tibetan-bowls/booking",
  },
  "/tibetan-bowls/media": {
    title: "Медиа тибетских поющих чаш | КООСМО",
    description: "Аудио и видео материалы о тибетских поющих чашах: звуковая терапия, медитации, практики.",
    keywords: "тибетские чаши аудио, медитация поющие чаши, звуковая терапия онлайн, КООСМО",
    canonical: "https://koosmo.ru/tibetan-bowls/media",
    ogUrl: "https://koosmo.ru/tibetan-bowls/media",
  },
  "/diagnostics": {
    title: "Диагностика здоровья по внешним признакам | КООСМО",
    description: "Диагностика здоровья по ногтям, языку, глазам, коже и телу в Бийске и Новосибирске. Узнайте о состоянии организма без анализов.",
    keywords: "диагностика здоровья Бийск, диагностика здоровья Новосибирск, диагностика по ногтям, диагностика по языку, диагностика по глазам",
    canonical: "https://koosmo.ru/diagnostics",
    ogUrl: "https://koosmo.ru/diagnostics",
  },
  "/diagnostics/booking": {
    title: "Запись на диагностику здоровья | КООСМО Бийск, Новосибирск",
    description: "Запишитесь на онлайн-диагностику здоровья в КООСМО. Выберите удобное время для консультации специалиста.",
    keywords: "запись на диагностику Бийск, запись на диагностику Новосибирск, онлайн диагностика здоровья",
    canonical: "https://koosmo.ru/diagnostics/booking",
    ogUrl: "https://koosmo.ru/diagnostics/booking",
  },
  "/diagnostics-schedule": {
    title: "Расписание диагностики здоровья | КООСМО",
    description: "Расписание онлайн-консультаций по диагностике здоровья в КООСМО. Запишитесь на удобное время.",
    keywords: "расписание диагностики, онлайн консультация здоровье, КООСМО",
    canonical: "https://koosmo.ru/diagnostics-schedule",
    ogUrl: "https://koosmo.ru/diagnostics-schedule",
  },
  "/analyses": {
    title: "Анализы и лабораторная диагностика | КООСМО",
    description: "Лабораторные анализы и исследования в Бийске и Новосибирске через партнёров КООСМО. Сдайте анализы и получите расшифровку.",
    keywords: "анализы Бийск, анализы Новосибирск, лабораторная диагностика, сдать анализы, КООСМО",
    canonical: "https://koosmo.ru/analyses",
    ogUrl: "https://koosmo.ru/analyses",
  },
  "/psychology": {
    title: "Психосоматика и психологическая поддержка | КООСМО",
    description: "Психологическая поддержка и психосоматика в Бийске и Новосибирске. Помогаем разобраться в связи эмоций и состояния тела.",
    keywords: "психолог Бийск, психолог Новосибирск, психосоматика, психологическая поддержка, КООСМО",
    canonical: "https://koosmo.ru/psychology",
    ogUrl: "https://koosmo.ru/psychology",
  },
  "/psychology/booking": {
    title: "Запись к психологу | КООСМО Бийск, Новосибирск",
    description: "Запишитесь на консультацию к психологу в Бийске и Новосибирске. Онлайн и очные приёмы.",
    keywords: "запись к психологу Бийск, запись к психологу Новосибирск, психолог онлайн, КООСМО",
    canonical: "https://koosmo.ru/psychology/booking",
    ogUrl: "https://koosmo.ru/psychology/booking",
  },
  "/streams": {
    title: "Прямые трансляции и онлайн-занятия | КООСМО",
    description: "Прямые трансляции, вебинары и онлайн-занятия по массажу, диагностике и здоровью от КООСМО. Присоединяйтесь.",
    keywords: "онлайн трансляции массаж, вебинары здоровье, онлайн занятия, КООСМО",
    canonical: "https://koosmo.ru/streams",
    ogUrl: "https://koosmo.ru/streams",
  },
  "/courses": {
    title: "Онлайн-курсы массажа и оздоровления | КООСМО",
    description: "Онлайн-курсы по массажу, диагностике, психосоматике и оздоровлению от КООСМО. Обучайтесь у профессионалов.",
    keywords: "онлайн курсы массаж, курсы диагностики, обучение массажу онлайн, КООСМО",
    canonical: "https://koosmo.ru/courses",
    ogUrl: "https://koosmo.ru/courses",
  },
  "/guide": {
    title: "Путеводитель по здоровью | КООСМО",
    description: "Полезные материалы о здоровье, массаже, диагностике и оздоровлении от экспертов КООСМО.",
    keywords: "путеводитель по здоровью, статьи о массаже, советы по оздоровлению, КООСМО",
    canonical: "https://koosmo.ru/guide",
    ogUrl: "https://koosmo.ru/guide",
  },
};

const DIAGNOSTIC_SEO: Record<string, Partial<RouteSeoConfig>> = {
  "nails": {
    title: "Диагностика по ногтям в Бийске и Новосибирске | КООСМО",
    description: "Диагностика здоровья по ногтям: определите возможные дефициты и проблемы организма по изменению ногтевой пластины. Запись онлайн.",
    keywords: "диагностика по ногтям Бийск, диагностика по ногтям Новосибирск, ногти и здоровье, КООСМО",
  },
  "tongue": {
    title: "Диагностика по языку в Бийске и Новосибирске | КООСМО",
    description: "Диагностика по языку: выявите дисбалансы в организме по налёту, цвету и состоянию языка. Запись онлайн.",
    keywords: "диагностика по языку Бийск, диагностика по языку Новосибирск, язык и здоровье, КООСМО",
  },
  "eyes": {
    title: "Диагностика по глазам в Бийске и Новосибирске | КООСМО",
    description: "Диагностика по глазам: оцените состояние органов и систем по радужке и белкам глаз. Запись онлайн.",
    keywords: "диагностика по глазам Бийск, диагностика по глазам Новосибирск, радужка диагностика, КООСМО",
  },
  "skin": {
    title: "Диагностика по коже в Бийске и Новосибирске | КООСМО",
    description: "Диагностика по коже: определите проблемы организма по состоянию кожи лица и тела. Запись онлайн.",
    keywords: "диагностика по коже Бийск, диагностика по коже Новосибирск, кожа и здоровье, КООСМО",
  },
  "body": {
    title: "Диагностика по телу в Бийске и Новосибирске | КООСМО",
    description: "Диагностика по телу: оцените общее состояние организма по внешним признакам тела. Запись онлайн.",
    keywords: "диагностика по телу Бийск, диагностика по телу Новосибирск, внешние признаки здоровья, КООСМО",
  },
};

const getRouteSeo = (pathname: string): RouteSeoConfig => {
  if (ROUTE_SEO[pathname]) return ROUTE_SEO[pathname];

  const diagMatch = matchPath("/diagnostics/:type", pathname);
  if (diagMatch) {
    const type = diagMatch.params.type as string;
    const diag = DIAGNOSTIC_SEO[type];
    const suffix = pathname.endsWith('/details') ? '/details' : '';
    const basePath = `/diagnostics/${type}${suffix}`;
    if (diag) {
      return {
        title: diag.title || DEFAULT_SEO.title,
        description: diag.description || DEFAULT_SEO.description,
        keywords: diag.keywords || DEFAULT_SEO.keywords,
        canonical: `https://koosmo.ru${basePath}`,
        ogUrl: `https://koosmo.ru${basePath}`,
      };
    }
  }

  const courseMatch = matchPath("/courses/:id", pathname);
  if (courseMatch) {
    return {
      title: "Онлайн-курс | КООСМО",
      description: "Онлайн-курс по массажу, диагностике или оздоровлению от КООСМО.",
      keywords: "онлайн курс, обучение массажу, КООСМО",
      canonical: `https://koosmo.ru${pathname}`,
      ogUrl: `https://koosmo.ru${pathname}`,
    };
  }

  return { ...DEFAULT_SEO, canonical: `https://koosmo.ru${pathname}`, ogUrl: `https://koosmo.ru${pathname}` };
};

const Layout = () => {
  const location = useLocation();
  const seo = getRouteSeo(location.pathname);

  return (
    <div className="w-full overflow-x-hidden">
      <SEO {...seo} />
      <Outlet />
    </div>
  );
};

export default Layout;