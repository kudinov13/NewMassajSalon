import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DiagnosticsTest from "./DiagnosticsTest";
import Header from "../components/Header";

const diagnosticIcons: Record<string, React.ReactNode> = {
  nails: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 16"/>
    </svg>
  ),
  tongue: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M12 16v3c0 1-1 2-2 2s-2-1-2-2"/>
    </svg>
  ),
  eyes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  skin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"/><path d="M8 12h8"/><path d="M12 8v8"/>
    </svg>
  ),
  body: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2"/><path d="M12 6v6"/><path d="M8 22l2-6"/><path d="M16 22l-2-6"/><path d="M6 12h12"/>
    </svg>
  ),
};

const diagnosticTypes = [
  {
    slug: "nails",
    title: "Диагностика ногтей",
    subtitle: "Ногти могут многое рассказать о состоянии вашего здоровья.",
  },
  {
    slug: "tongue",
    title: "Диагностика языка",
    subtitle: "Язык — зеркало внутреннего состояния вашего организма.",
  },
  {
    slug: "eyes",
    title: "Диагностика глаз",
    subtitle: "Глаза отражают состояние сосудов и нервной системы.",
  },
  {
    slug: "skin",
    title: "Диагностика кожи",
    subtitle: "Кожа — индикатор работы внутренних органов и систем.",
  },
  {
    slug: "body",
    title: "Диагностика тела и осанки",
    subtitle: "Комплексная оценка состояния тела, осанки и опорно-двигательного аппарата.",
  },
];

const DiagnosticsPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [showTest, setShowTest] = React.useState(false);

  const current = diagnosticTypes.find((d) => d.slug === type) || diagnosticTypes[0];

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header activeItem="Диагностика" />

      {/* Content */}
      <main className="flex flex-col items-center justify-center pt-24 pb-20 px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e3cbb1]">
            {diagnosticIcons[current.slug]}
          </span>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base">
            Профессиональная диагностика
          </span>
        </div>

        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl sm:text-5xl md:text-[64px] tracking-[-2px] leading-tight text-center mb-4">
          {current.title}
        </h1>

        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base text-center mb-10">
          {current.subtitle}
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowTest(true)}
            className="h-12 px-8 bg-white border border-[#C9A882] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base cursor-pointer hover:bg-[#f5e6d3] transition-colors"
          >
            Пройти тест
          </button>
          <button
            type="button"
            onClick={() => navigate(`/diagnostics/${current.slug}/details`)}
            className="h-12 px-8 bg-white border border-[#C9A882] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base cursor-pointer hover:bg-[#f5e6d3] transition-colors"
          >
            Узнать больше
          </button>
        </div>
      </main>

      {showTest && (
        <DiagnosticsTest type={current.slug} onClose={() => setShowTest(false)} />
      )}
    </div>
  );
};

export default DiagnosticsPage;
