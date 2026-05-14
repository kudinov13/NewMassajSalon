import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const diagnosticContent: Record<string, {
  title: string;
  subtitle: string;
  aboutTitle: string;
  aboutText: string;
  indicators: string[];
  healthy: string[];
  changes: string[];
  conclusion: string;
  image: string;
}> = {
  nails: {
    title: "Диагностика ногтей",
    subtitle: "Ногти могут многое рассказать о состоянии вашего здоровья.",
    aboutTitle: "О диагностике",
    aboutText: "Диагностика по ногтям — один из методов оценки здоровья, который позволяет определить состояние внутренних органов по цвету, форме и структуре ногтевых пластин.",
    indicators: [
      "Цвет ногтевой пластины",
      "Форма и рельеф поверхности",
      "Толщина и прочность",
      "Скорость роста",
      "Состояние кутикулы и ногтевого ложа",
    ],
    healthy: [
      "Ровная гладкая поверхность",
      "Розовый цвет с белой лункой",
      "Отсутствие борозд и пятен",
      "Нормальная скорость роста",
    ],
    changes: [
      "Жёлтые ногти — проблемы с печенью, грибковые инфекции",
      "Белые пятна — недостаток цинка, кальция",
      "Продольные борозды — нарушение обмена веществ",
      "Хрупкость — недостаток витаминов, гормональные нарушения",
      "Вогнутость — железодефицитная анемия",
    ],
    conclusion: "Регулярная диагностика ногтей помогает выявить проблемы со здоровьем на ранних стадиях и скорректировать питание и образ жизни.",
    image: "/diag-nails.png",
  },
  tongue: {
    title: "Диагностика языка",
    subtitle: "Язык является зеркалом здоровья организма. По его цвету, форме и налёту можно определить состояние внутренних органов.",
    aboutTitle: "О диагностике",
    aboutText: "Диагностика по языку - один из древнейших методов оценки здоровья, широко используемый в традиционной китайской медицине и аюрведе.",
    indicators: [
      "Цвет языка (розовый, красный, бледный, синюшный)",
      "Форма и размер",
      "Наличие и характер налёта",
      "Влажность поверхности",
      "Состояние сосочков",
    ],
    healthy: [
      "Розовый цвет",
      "Влажная поверхность",
      "Тонкий белый налёт",
      "Ровные края без отпечатков зубов",
    ],
    changes: [
      "Красный цвет — воспалительные процессы, жар",
      "Бледный цвет — анемия, недостаток энергии",
      "Жёлтый налёт — проблемы с печенью, желчным пузырём",
      "Синюшный оттенок — проблемы с кровообращением",
      "Толстый налёт — накопление токсинов",
    ],
    conclusion: "Толстый налёт может свидетельствовать о накоплении токсинов, а трещины — о обезвоживании.",
    image: "/diag-tongue.png",
  },
  eyes: {
    title: "Диагностика глаз",
    subtitle: "Глаза - это не только орган зрения, но и индикатор общего состояния здоровья. По состоянию глаз можно определить многие заболевания.",
    aboutTitle: "О диагностике",
    aboutText: "Диагностика по глазам - важный метод оценки здоровья, который используется как в традиционной, так и в народной медицине.",
    indicators: [
      "Цвет белков глаз (склер)",
      "Яркость и ясность радужки",
      "Состояние сосудов глазного дна",
      "Наличие отеков или кругов под глазами",
      "Общее состояние зрения",
    ],
    healthy: [
      "Чистые белые склеры без желтизны",
      "Яркие и ясные радужки",
      "Отсутствие постоянного покраснения",
      "Хорошее зрение без утомления",
    ],
    changes: [
      "Желтизна склер — проблемы с печенью",
      "Покраснение — воспалительные процессы",
      "Отеки — проблемы с почками или сердцем",
      "Утомляемость — недостаток витаминов",
    ],
    conclusion: "Регулярная диагностика помогает выявить проблемы на ранних стадиях и предотвратить развитие серьезных заболеваний.",
    image: "/diag-eyes.png",
  },
  skin: {
    title: "Диагностика кожи",
    subtitle: "Кожа - самый большой орган человека, который отражает состояние внутреннего здоровья и работает как защитный барьер организма.",
    aboutTitle: "О диагностике",
    aboutText: "Диагностика по коже - древний метод оценки здоровья, используемый во многих системах традиционной медицины.",
    indicators: [
      "Цвет и тон кожи",
      "Влажность и эластичность",
      "Наличие высыпаний или раздражений",
      "Состояние пор и сальных желез",
      "Наличие пигментации или родинок",
    ],
    healthy: [
      "Ровного цвета без пятен",
      "Упругой и эластичной",
      "Без чрезмерной сухости или жирности",
      "Без воспалений и высыпаний",
      "С хорошим кровообращением",
    ],
    changes: [
      "Бледность — анемия, проблемы с кровообращением",
      "Желтизна — проблемы с печенью",
      "Покраснение — воспалительные процессы, аллергии",
      "Сухость — недостаток витаминов, обезвоживание",
      "Высыпания — проблемы с пищеварением, гормональный дисбаланс",
    ],
    conclusion: "Правильный уход и регулярная диагностика помогут поддерживать здоровье кожи и выявлять проблемы на ранних стадиях.",
    image: "/diag-skin.png",
  },
  body: {
    title: "Диагностика тела и осанки",
    subtitle: "Правильная осанка - залог здоровья позвоночника и всего организма. Нарушения осанки могут привести к серьезным проблемам со здоровьем.",
    aboutTitle: "О диагностике",
    aboutText: "Диагностика осанки позволяет выявить нарушения опорно-двигательного аппарата на ранних стадиях. Правильная осанка обеспечивает оптимальное функционирование всех органов и систем организма.",
    indicators: [
      "Положение головы и шеи",
      "Симметричность плеч и лопаток",
      "Изгибы позвоночника",
      "Положение таза",
      "Распределение веса тела",
    ],
    healthy: [
      "Ровное положение головы",
      "Симметричные плечи на одном уровне",
      "Естественные физиологические изгибы позвоночника",
      "Правильное положение таза",
    ],
    changes: [
      "Хронические боли в спине",
      "Головные боли",
      "Нарушения дыхания",
      "Проблемы с пищеварением",
      "Быструю утомляемость",
    ],
    conclusion: "Регулярная диагностика и коррекция осанки помогут предотвратить развитие серьезных заболеваний опорно-двигательного аппарата.",
    image: "/diag-body.png",
  },
};

const DiagnosticsDetailPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const content = diagnosticContent[type || "nails"] || diagnosticContent.nails;

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header activeItem="Диагностика" />

      {/* Hero */}
      <section className="max-w-[900px] mx-auto text-center pt-16 pb-10 px-4">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl sm:text-5xl md:text-[56px] tracking-[-2px] leading-tight mb-4">
          {content.title}
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-lg max-w-[600px] mx-auto">
          {content.subtitle}
        </p>
      </section>

      {/* About + Image */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 py-10 overflow-visible">
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12 overflow-visible">
          <div className="flex-1">
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-4">
              {content.aboutTitle}
            </h2>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed mb-6">
              {content.aboutText}
            </p>
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-3">
              Основные показатели:
            </h3>
            <ul className="list-none p-0 m-0 space-y-2 mb-6">
              {content.indicators.map((item, i) => (
                <li key={i} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base flex items-start gap-2">
                  <span className="text-[#a6856d] mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${type === "tongue" ? "hidden" : "w-full md:w-[400px]"} flex-shrink-0 relative overflow-visible order-first md:order-last mx-auto md:mx-0`}>
            {type === "nails" ? (
              <>
                <img
                  src="/diag-nails.png"
                  alt="Диагностика ногтей"
                  className="relative z-0 w-[320px] h-[400px] object-cover rounded-[20px] ml-auto block"
                />
                <img
                  src="/diag-nails-2.png"
                  alt="Руки"
                  className="absolute bottom-[-40px] left-[-10px] z-10 w-[180px] h-[280px] object-cover rounded-[15px] shadow-md"
                />
              </>
            ) : type === "tongue" ? null : (
              <img
                src={content.image}
                alt={content.title}
                className="w-full h-[400px] object-cover rounded-[25px]"
              />
            )}
          </div>
        </div>
      </section>

      {/* Healthy indicators */}
      <section className="max-w-[1100px] mx-auto px-10 py-8">
        <div className="bg-[#e3cbb1]/50 rounded-[25px] p-8">
          <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-4">
            Признаки здоровья:
          </h3>
          <ul className="list-none p-0 m-0 space-y-2">
            {content.healthy.map((item, i) => (
              <li key={i} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base flex items-start gap-2">
                <span className="text-[#a6856d] mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Changes */}
      <section className="max-w-[1100px] mx-auto px-10 py-8">
        <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-4">
          На что указывают изменения:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.changes.map((item, i) => (
            <div key={i} className="bg-white/60 rounded-[15px] p-4 border border-[#C9A882]">
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      <section className="max-w-[1100px] mx-auto px-10 py-10 pb-20">
        <div className="text-center">
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed max-w-[700px] mx-auto mb-8">
            {content.conclusion}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/diagnostics/${type}`)}
            className="h-12 px-8 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base border-0 cursor-pointer transition-colors"
          >
            Пройти диагностику
          </button>
        </div>
      </section>
    </div>
  );
};

export default DiagnosticsDetailPage;
