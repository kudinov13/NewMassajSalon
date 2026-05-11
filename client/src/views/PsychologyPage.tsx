import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

const organs = [
  { emoji: "❤️", title: "Сердце и сосуды", desc: "Стресс, тревога, гнев — повышенное давление, аритмия" },
  { emoji: "🫁", title: "Дыхательная система", desc: "Подавленные эмоции — астма, затруднённое дыхание" },
  { emoji: "🍽️", title: "Пищеварительная система", desc: "Тревожность, беспокойство — язвы, СРК, расстройства" },
  { emoji: "🦴", title: "Опорно-двигательный аппарат", desc: "Напряжение, стресс — боли в спине, мышечные зажимы" },
];

const offers = [
  { icon: "🔍", text: "Диагностика психосоматических причин заболеваний" },
  { icon: "💡", text: "Консультации с профессиональным психологом" },
  { icon: "📚", text: "Обучающие видео-курсы по психосоматике" },
  { icon: "🛠️", text: "Практические техники работы с эмоциями" },
  { icon: "🌿", text: "Интеграция психологических и телесных практик" },
];

const navItems = [
  { label: "Диагностика", path: "/diagnostics/nails" },
  { label: "Анализы", path: "/analyses" },
  { label: "Трансляции", path: "/streams" },
  { label: "Тибетские чаши", path: "/tibetan-bowls" },
  { label: "Психология", path: "/psychology" },
];

const PsychologyPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [price, setPrice] = useState("3500");
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => {
        if (u) { setIsAuthenticated(true); if (u.isAdmin) setIsAdmin(true); }
      })
      .catch(() => {});
    API.settings.get()
      .then((s) => { if (s.psychologyPrice) setPrice(s.psychologyPrice); })
      .catch(() => {});
  }, []);

  const savePrice = async () => {
    if (!priceInput.trim()) return;
    await API.settings.update({ psychologyPrice: priceInput });
    setPrice(priceInput);
    setEditingPrice(false);
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      {/* Header */}
      <header className="w-full px-10 py-6 flex items-center justify-between relative z-20">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">Harmony Spa</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <span
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`px-4 py-1.5 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors inline-block ${
                item.path === "/psychology"
                  ? "bg-[#a6856d] text-white border-[#a6856d]"
                  : "border-[#00000033] text-[#000000b2] hover:bg-[#a6856d] hover:text-white hover:border-transparent"
              }`}
            >
              {item.label}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline" title="Корзина">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </Link>
              <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline" title="Личный кабинет">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            </>
          ) : (
            <Link to="/login" className="flex h-[34px] items-center justify-center px-6 bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors no-underline">
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white text-base">Вход</span>
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-10 pb-16">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-4xl tracking-[-1px] mb-4">
            Психосоматика: связь души и тела
          </h1>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-lg leading-relaxed max-w-[800px]">
            Психосоматика изучает влияние психологических факторов на возникновение и течение телесных заболеваний.
            Наши мысли, эмоции и переживания напрямую влияют на физическое здоровье и могут проявляться в виде различных симптомов.
          </p>
        </div>

        {/* Organs */}
        <div className="mb-12">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6">
            Как эмоции влияют на органы и системы
          </h2>
          <div className="grid grid-cols-2 gap-5">
            {organs.map((o) => (
              <div key={o.title} className="bg-white/70 rounded-[20px] p-6 flex items-start gap-4">
                <span className="text-3xl flex-shrink-0 mt-1">{o.emoji}</span>
                <div>
                  <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-1">{o.title}</h3>
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/80 text-base">{o.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What we offer */}
        <div className="mb-12">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6">
            Что мы предлагаем
          </h2>
          <div className="bg-white/70 rounded-[20px] p-8">
            <div className="grid grid-cols-1 gap-4">
              {offers.map((o) => (
                <div key={o.text} className="flex items-center gap-4">
                  <span className="text-xl flex-shrink-0">{o.icon}</span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base">{o.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Psychologist */}
        <div className="mb-12">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6">
            Наш психолог
          </h2>
          <div className="bg-white/70 rounded-[20px] p-8 flex items-start gap-8">
            <div className="w-24 h-24 rounded-full bg-[#a6856d] flex items-center justify-center flex-shrink-0">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-1">
                Коюшева Оксана Викторовна
              </h3>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#a6856d] text-base mb-3">
                Психолог, специалист по психосоматике
              </p>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/80 text-base leading-relaxed">
                Опыт работы более 10 лет. Специализация: психосоматические расстройства, работа с тревожностью,
                паническими атаками, психологическими причинами хронических заболеваний.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-base">Стоимость консультации:</span>
            {editingPrice ? (
              <span className="inline-flex items-center gap-2">
                <input
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="h-9 w-24 px-3 rounded-[10px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] text-sm text-[#6B5744] outline-none"
                />
                <button onClick={savePrice} className="h-9 px-3 bg-[#a6856d] text-white rounded-[10px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] text-xs">Сохранить</button>
                <button onClick={() => setEditingPrice(false)} className="h-9 px-3 bg-white text-[#6B5744] rounded-[10px] border border-[#e3cbb1] cursor-pointer [font-family:'Vela_Sans',sans-serif] text-xs">Отмена</button>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl">{price} ₽</span>
                {isAdmin && (
                  <button
                    onClick={() => { setPriceInput(price); setEditingPrice(true); }}
                    className="w-7 h-7 rounded-full border border-[#e3cbb1] bg-transparent flex items-center justify-center cursor-pointer hover:bg-[#f5e6d3] transition-colors"
                    title="Редактировать цену"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                )}
              </span>
            )}
          </div>
          <br/>
          <button
            onClick={() => navigate("/psychology/booking")}
            className="h-14 px-10 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-normal text-lg border-0 cursor-pointer transition-colors shadow-lg"
          >
            Записаться на консультацию
          </button>
        </div>
      </div>
    </div>
  );
};

export default PsychologyPage;
