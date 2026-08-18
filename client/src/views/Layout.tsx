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
  title: "Массаж в Бийске — записаться на массаж: расслабляющий, классический, лимфодренажный | КООСМО",
  description: "Массаж в Бийске — студия КООСМО. Расслабляющий, классический, лимфодренажный массаж, массаж спины в Бийске и Новосибирске. Тибетские чаши, диагностика, психосоматика. Запись онлайн на массаж в Бийске.",
  keywords: "массаж в Бийске, массаж в бийск, записаться на массаж Бийск, массаж Бийск, массаж Новосибирск, расслабляющий массаж Бийск, классический массаж Бийск, массаж спины Бийск, лимфодренажный массаж Бийск, массажист Бийск, массажный салон Бийск, тибетские поющие чаши, виброакустический массаж, диагностика по языку, диагностика по ногтям, диагностика по глазам, спа Бийск, оздоровительный центр Бийск, психолог Бийск, психосоматика, КООСМО",
  canonical: "https://koosmo.ru",
  ogUrl: "https://koosmo.ru",
};

const BASE_SCHEMAS = {
  localBusiness: {
    "@type": ["LocalBusiness", "MedicalBusiness", "HealthAndBeautyBusiness"],
    "name": "КООСМО — массаж в Бийске",
    "alternateName": "КООСМО массаж Бийск",
    "url": "https://koosmo.ru",
    "logo": "https://koosmo.ru/logo512.png",
    "image": "https://koosmo.ru/logo512.png",
    "description": "Студия массажа в Бийске — КООСМО. Профессиональный массаж в Бийске: расслабляющий, классический, лимфодренажный, массаж спины. Тибетские поющие чаши, виброакустический массаж, диагностика по внешним признакам и онлайн-курсы в Бийске и Новосибирске.",
    "priceRange": "₽₽",
    "currenciesAccepted": "RUB",
    "paymentAccepted": "Cash, Card",
    "telephone": "+79095054658",
    "areaServed": [{"@type": "City", "name": "Бийск"}, {"@type": "City", "name": "Новосибирск"}],
    "address": {"@type": "PostalAddress", "addressLocality": "Бийск", "addressRegion": "Алтайский край", "addressCountry": "RU"},
    "geo": {"@type": "GeoCoordinates", "latitude": "52.5362", "longitude": "85.2148"},
    "sameAs": ["https://vk.com/koosmo.zdrav.massag", "https://t.me/koosmo_zdravmassag", "https://max.ru/id2204096914_biz"],
    "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "Russian" }
  },
  massageService: {
    "@type": "Service",
    "name": "Массаж в Бийске — записаться онлайн",
    "description": "Профессиональный массаж в Бийске: расслабляющий, классический, лимфодренажный массаж и массаж спины в Бийске и Новосибирске. Запись на массаж в Бийске онлайн.",
    "areaServed": [{"@type": "City", "name": "Бийск"}, {"@type": "City", "name": "Новосибирск"}],
    "provider": { "@type": "Organization", "name": "КООСМО" }
  },
  breadcrumb: (items: {name: string, url: string}[]) => ({
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  }),
  faq: (questions: {q: string, a: string}[]) => ({
    "@type": "FAQPage",
    "mainEntity": questions.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  }),
  person: (name: string, jobTitle: string, image?: string) => ({
    "@type": "Person",
    "name": name,
    "jobTitle": jobTitle,
    "worksFor": { "@type": "Organization", "name": "КООСМО" },
    "image": image || "https://koosmo.ru/logo512.png",
    "url": "https://koosmo.ru"
  }),
  service: (name: string, description: string) => ({
    "@type": "Service",
    "name": name,
    "description": description,
    "areaServed": [{"@type": "City", "name": "Бийск"}, {"@type": "City", "name": "Новосибирск"}],
    "provider": { "@type": "Organization", "name": "КООСМО" }
  })
};

const ROUTE_SEO: Record<string, RouteSeoConfig> = {
  "/": {
    ...DEFAULT_SEO,
    schema: [
      BASE_SCHEMAS.localBusiness,
      BASE_SCHEMAS.person("Кюльпер Татьяна Альбертовна", "Специалист по массажу и диагностике"),
      BASE_SCHEMAS.person("Тимкина Наталья Александровна", "Специалист по массажу и оздоровлению"),
      BASE_SCHEMAS.person("Коюшева Оксана Викторовна", "Специалист по тибетским поющим чашам"),
    ],
  },
  "/about": {
    title: "О студии КООСМО — массаж, диагностика, оздоровление в Бийске",
    description: "Узнайте о студии КООСМО в Бийске и Новосибирске: профессиональный массаж (расслабляющий, классический, лимфодренажный), диагностика по внешним признакам, тибетские поющие чаши и онлайн-курсы.",
    keywords: "о студии КООСМО, массаж Бийск, массаж Новосибирск, оздоровительный центр Бийск, диагностика здоровья, тибетские чаши, КООСМО",
    canonical: "https://koosmo.ru/about",
    ogUrl: "https://koosmo.ru/about",
    schema: [BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "О студии", url: "https://koosmo.ru/about"}]), BASE_SCHEMAS.faq([
      {q: "Где находится студия КООСМО?", a: "Студия КООСМО находится в Новосибирске, ул. Хмельницкого, 1. Точный адрес и карту проезда можно найти на странице контактов."},
      {q: "Какие услуги предлагает КООСМО?", a: "КООСМО предлагает массаж (расслабляющий, классический, лимфодренажный), тибетские поющие чаши, диагностику по внешним признакам, психологическую поддержку и онлайн-курсы."},
      {q: "Можно ли записаться онлайн?", a: "Да, запись на все услуги доступна онлайн через сайт koosmo.ru/schedule или по телефону +7 (909) 505-46-58."}
    ])],
  },
  "/reviews": {
    title: "Отзывы клиентов — массаж, диагностика, тибетские чаши | КООСМО Бийск, Новосибирск",
    description: "Читайте отзывы клиентов КООСМО о массаже, диагностике и тибетских поющих чашах в Бийске и Новосибирске. Делитесь своим опытом.",
    keywords: "отзывы массаж Бийск, отзывы массаж Новосибирск, отзывы КООСМО, отзывы диагностика, отзывы тибетские чаши, массаж отзывы",
    canonical: "https://koosmo.ru/reviews",
    ogUrl: "https://koosmo.ru/reviews",
    schema: [{
      "@type": "WebPage",
      "name": "Отзывы клиентов КООСМО",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "bestRating": "5",
        "reviewCount": "120"
      }
    }, BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Отзывы", url: "https://koosmo.ru/reviews"}])],
  },
  "/shop": {
    title: "Магазин товаров для здоровья и красоты — БАДы, ароматерапия, курсы | КООСМО",
    description: "Магазин КООСМО: товары для здоровья, красоты, ароматерапии, SPA-рецепты, видео-курсы по массажу и БАДы с доставкой по России из Бийска.",
    keywords: "магазин здоровья, ароматерапия, SPA товары, видео курсы массаж, БАДы, товары для здоровья, КООСМО",
    canonical: "https://koosmo.ru/shop",
    ogUrl: "https://koosmo.ru/shop",
    schema: BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Магазин", url: "https://koosmo.ru/shop"}]),
  },
  "/schedule": {
    title: "Запись на массаж в Бийске — расслабляющий, классический, лимфодренажный | КООСМО",
    description: "Запишитесь на массаж в студии КООСМО в Бийске и Новосибирске. Выберите удобное время онлайн: расслабляющий, классический, лимфодренажный массаж, массаж спины.",
    keywords: "запись на массаж Бийск, запись на массаж Новосибирск, расслабляющий массаж Бийск, классический массаж запись, массаж спины запись, лимфодренажный массаж запись, КООСМО",
    canonical: "https://koosmo.ru/schedule",
    ogUrl: "https://koosmo.ru/schedule",
    schema: [BASE_SCHEMAS.massageService, BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Запись на массаж", url: "https://koosmo.ru/schedule"}])],
  },
  "/tibetan-bowls": {
    title: "Тибетские поющие чаши — виброакустический массаж и звуковая терапия | Бийск, Новосибирск",
    description: "Сеансы тибетских поющих чаш в Бийске и Новосибирске: виброакустический массаж, глубокое расслабление, снятие стресса, улучшение сна и восстановление жизненных сил. Запишитесь онлайн.",
    keywords: "тибетские поющие чаши Бийск, тибетские чаши Новосибирск, виброакустический массаж, звуковая терапия, медитация Бийск, расслабление поющие чаши, КООСМО",
    canonical: "https://koosmo.ru/tibetan-bowls",
    ogUrl: "https://koosmo.ru/tibetan-bowls",
    schema: [{
      "@type": "Service",
      "name": "Тибетские поющие чаши — виброакустический массаж",
      "description": "Сеансы звуковой терапии и виброакустического массажа тибетскими поющими чашами в Бийске и Новосибирске.",
      "areaServed": [{"@type": "City", "name": "Бийск"}, {"@type": "City", "name": "Новосибирск"}],
      "provider": { "@type": "Organization", "name": "КООСМО" }
    }, BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Тибетские поющие чаши", url: "https://koosmo.ru/tibetan-bowls"}])],
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
    title: "Диагностика здоровья по внешним признакам в Бийске — по ногтям, языку, глазам | КООСМО",
    description: "Диагностика здоровья по ногтям, языку, глазам, коже и телу в Бийске и Новосибирске. Узнайте о состоянии организма без анализов. Запись онлайн.",
    keywords: "диагностика здоровья Бийск, диагностика здоровья Новосибирск, диагностика по ногтям, диагностика по языку, диагностика по глазам, диагностика по коже, диагностика по телу, КООСМО",
    canonical: "https://koosmo.ru/diagnostics",
    ogUrl: "https://koosmo.ru/diagnostics",
    schema: [BASE_SCHEMAS.service("Диагностика здоровья по внешним признакам", "Диагностика по ногтям, языку, глазам, коже и телу в Бийске и Новосибирске."), BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Диагностика", url: "https://koosmo.ru/diagnostics"}]), BASE_SCHEMAS.faq([
      {q: "Как проходит диагностика по внешним признакам?", a: "Диагностика включает оценку по ногтям, языку, глазам, коже и телу. Специалист определяет возможные дефициты и дисбалансы без анализов. Доступна онлайн и очно."},
      {q: "Сколько стоит диагностика?", a: "Стоимость диагностики зависит от типа. Запись и уточнение цен доступны на странице записи."},
      {q: "Нужна ли подготовка к диагностике?", a: "Специальной подготовки не требуется. Достаточно прийти без макияжа (для диагностики по коже и глазам) и иметь чистые ногти."}
    ])],
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
    schema: [BASE_SCHEMAS.service("Анализы и лабораторная диагностика", "Лабораторные анализы и исследования в Бийске и Новосибирске через партнёров КООСМО."), BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Анализы", url: "https://koosmo.ru/analyses"}])],
  },
  "/psychology": {
    title: "Психолог в Бийске — психосоматика и психологическая поддержка | КООСМО",
    description: "Психологическая поддержка и психосоматика в Бийске и Новосибирске. Помогаем разобраться в связи эмоций и состояния тела. Онлайн и очные консультации.",
    keywords: "психолог Бийск, психолог Новосибирск, психосоматика, психологическая поддержка, психологическая помощь Бийск, консультация психолога, КООСМО",
    canonical: "https://koosmo.ru/psychology",
    ogUrl: "https://koosmo.ru/psychology",
    schema: [BASE_SCHEMAS.service("Психологическая поддержка и психосоматика", "Психосоматика и психологическая помощь в Бийске и Новосибирске. Онлайн и очные консультации."), BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Психология", url: "https://koosmo.ru/psychology"}]), BASE_SCHEMAS.faq([
      {q: "Что такое психосоматика?", a: "Психосоматика — это направление, изучающее связь между эмоциональным состоянием и физическим здоровьем. Помогает понять, как стресс и эмоции влияют на тело."},
      {q: "Как записаться к психологу?", a: "Запись на консультацию доступна онлайн через сайт koosmo.ru/psychology/booking или по телефону +7 (909) 505-46-58."},
      {q: "Онлайн или очно?", a: "КООСМО предлагает как очные консультации в Бийске и Новосибирске, так и онлайн-консультации."}
    ])],
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
    schema: BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Трансляции", url: "https://koosmo.ru/streams"}]),
  },
  "/courses": {
    title: "Онлайн-курсы массажа, диагностики и оздоровления | КООСМО Бийск",
    description: "Онлайн-курсы по массажу, диагностике здоровья, психосоматике и оздоровлению от КООСМО. Обучайтесь у профессионалов. Видеоуроки доступные после покупки.",
    keywords: "онлайн курсы массаж, курсы массажа Бийск, обучение массажу онлайн, курсы диагностики, обучение диагностике здоровья, КООСМО",
    canonical: "https://koosmo.ru/courses",
    ogUrl: "https://koosmo.ru/courses",
    schema: BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Курсы", url: "https://koosmo.ru/courses"}]),
  },
  "/guide": {
    title: "Путеводитель по здоровью | КООСМО",
    description: "Полезные материалы о здоровье, массаже, диагностике и оздоровлении от экспертов КООСМО.",
    keywords: "путеводитель по здоровью, статьи о массаже, советы по оздоровлению, КООСМО",
    canonical: "https://koosmo.ru/guide",
    ogUrl: "https://koosmo.ru/guide",
    schema: BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Путеводитель", url: "https://koosmo.ru/guide"}]),
  },
  "/before-after": {
    title: "Результаты до и после — массаж, диагностика, оздоровление | КООСМО",
    description: "Реальные результаты клиентов КООСМО до и после процедур: массаж, тибетские чаши, диагностика, психосоматика. Фото и описания работ.",
    keywords: "результаты массажа до и после, фото до после массаж, результаты оздоровления, КООСМО результаты",
    canonical: "https://koosmo.ru/before-after",
    ogUrl: "https://koosmo.ru/before-after",
    schema: BASE_SCHEMAS.breadcrumb([{name: "Главная", url: "https://koosmo.ru"}, {name: "Результаты", url: "https://koosmo.ru/before-after"}]),
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