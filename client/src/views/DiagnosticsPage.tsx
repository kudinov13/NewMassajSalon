import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { API } from "../services/api";
import DiagnosticsTest from "./DiagnosticsTest";

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

const navItems = [
  "Диагностика",
  "Анализы",
  "Самомассаж",
  "Прямые трансляции",
  "Тибетские чаши",
  "Психология",
];

const DiagnosticsPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [showTest, setShowTest] = React.useState(false);

  React.useEffect(() => {
    API.user.getCurrentUser().then(() => setIsAuthenticated(true)).catch(() => setIsAuthenticated(false));
  }, []);

  const current = diagnosticTypes.find((d) => d.slug === type) || diagnosticTypes[0];

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      {/* Header */}
      <header className="w-full px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Harmony Spa
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item}
              className="relative"
              onMouseEnter={() => item === "Диагностика" && setDropdownOpen(true)}
              onMouseLeave={() => item === "Диагностика" && setDropdownOpen(false)}
            >
              <span
                onClick={() => {
                  if (item === "Тибетские чаши") navigate("/tibetan-bowls");
                  if (item === "Самомассаж") navigate("/shop?category=self-massage");
                  if (item === "Диагностика") navigate("/diagnostics/nails");
                  if (item === "Анализы") navigate("/analyses");
                  if (item === "Прямые трансляции") navigate("/streams");
                  if (item === "Психология") navigate("/psychology");
                }}
                className={`px-4 py-1.5 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors ${
                  item === "Диагностика"
                    ? "bg-[#a6856d] text-white border-transparent"
                    : "border-[#00000033] text-[#000000b2] hover:bg-[#a6856d] hover:text-white hover:border-transparent"
                }`}
              >
                {item}
              </span>
              {item === "Диагностика" && dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-[15px] shadow-lg py-3 px-2 min-w-[200px] z-50">
                  {diagnosticTypes.map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => { navigate(`/diagnostics/${d.slug}`); setDropdownOpen(false); }}
                      className={`block w-full text-left px-4 py-2 rounded-[10px] [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors ${
                        d.slug === type
                          ? "bg-[#a6856d] text-white"
                          : "bg-transparent text-[#6B5744] hover:bg-[#f5e6d3]"
                      }`}
                    >
                      {d.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Корзина"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </Link>
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Профиль"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            </>
          ) : (
            <Link to="/login" className="flex h-[34px] items-center justify-center px-6 bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors no-underline">
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white text-base">Вход</span>
            </Link>
          )}
        </div>
      </header>

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

        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[64px] tracking-[-2px] leading-tight text-center mb-4">
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
