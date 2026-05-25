import React from "react";
import { Link } from "react-router-dom";

const DiagnosticsSchedulePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efdec5] px-10 py-10">
      <div className="max-w-[980px] mx-auto">
        <Link to="/schedule" className="inline-flex items-center gap-2 text-[#6B5744] no-underline [font-family:'Vela_Sans',sans-serif] font-light text-sm mb-10 hover:text-[#a6856d]">
          ← Назад к расписанию
        </Link>

        <section className="text-center mb-10">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#e3cbb1] text-[#6B5744] [font-family:'Vela_Sans',sans-serif] font-light text-sm mb-5">
            Расписание диагностики
          </span>
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[46px] leading-tight tracking-[-1.5px] mb-4">
            Запись на диагностику
          </h1>
          <p className="max-w-[620px] mx-auto [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/75 text-base leading-relaxed">
            Выберите удобное время для онлайн-консультации со специалистом по диагностике. После записи вы получите доступ к видеокомнате для созвона.
          </p>
        </section>

        <div className="flex justify-center">
          <Link
            to="/diagnostics/booking"
            className="group bg-[#f7ead8] rounded-[28px] p-10 border border-[#C9A882] no-underline hover:shadow-xl hover:-translate-y-1 transition-all max-w-md w-full"
          >
            <div className="w-16 h-16 rounded-full bg-[#a6856d] flex items-center justify-center mb-6 mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl mb-4 text-center">
              Диагностика
            </h2>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-base leading-relaxed mb-8 text-center">
              Онлайн-консультация со специалистом по диагностике. Выберите свободный слот и получите ссылку на видеокомнату.
            </p>
            <div className="flex justify-center">
              <span className="inline-flex h-12 px-8 items-center bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base group-hover:bg-[#8d6e58]">
                Выбрать расписание
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsSchedulePage;
