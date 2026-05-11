import React from "react";
import { Link } from "react-router-dom";

const SchedulePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#efdec5] px-10 py-10">
      <div className="max-w-[980px] mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#6B5744] no-underline [font-family:'Vela_Sans',sans-serif] font-light text-sm mb-10 hover:text-[#a6856d]">
          ← На главную
        </Link>

        <section className="text-center mb-10">
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#e3cbb1] text-[#6B5744] [font-family:'Vela_Sans',sans-serif] font-light text-sm mb-5">
            Расписание приёма
          </span>
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[46px] leading-tight tracking-[-1.5px] mb-4">
            Выберите направление записи
          </h1>
          <p className="max-w-[620px] mx-auto [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/75 text-base leading-relaxed">
            На этой странице можно выбрать расписание специалиста и записаться на удобное время. Выберите, какая услуга вам нужна: консультация психолога или терапия тибетскими чашами.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/psychology/booking" className="group bg-[#f7ead8] rounded-[28px] p-8 border border-[#C9A882] no-underline hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 rounded-full bg-[#a6856d] flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-3">Запись к психологу</h2>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm leading-relaxed mb-6">
              Индивидуальная консультация онлайн. Подберите свободный слот и получите ссылку на видеокомнату.
            </p>
            <span className="inline-flex h-10 px-5 items-center bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm group-hover:bg-[#8d6e58]">
              Выбрать расписание
            </span>
          </Link>

          <Link to="/tibetan-bowls/booking" className="group bg-[#f7ead8] rounded-[28px] p-8 border border-[#C9A882] no-underline hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 rounded-full bg-[#a6856d] flex items-center justify-center mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-3">Тибетские чаши</h2>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm leading-relaxed mb-6">
              Звуко-акустическая вибрационная терапия и практики глубокого расслабления.
            </p>
            <span className="inline-flex h-10 px-5 items-center bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm group-hover:bg-[#8d6e58]">
              Выбрать расписание
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
