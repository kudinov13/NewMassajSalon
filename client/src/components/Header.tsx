import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

const NAV_ITEMS = [
  { label: "Диагностика", path: "/diagnostics/nails" },
  { label: "Анализы", path: "/analyses" },
  { label: "Самомассаж", path: "/shop?category=self-massage" },
  { label: "Трансляции", path: "/streams" },
  { label: "Тибетские чаши", path: "/tibetan-bowls" },
  { label: "Психология", path: "/psychology" },
];

const DIAG_OPTIONS = [
  { label: "Диагностика ногтей", slug: "nails" },
  { label: "Диагностика языка", slug: "tongue" },
  { label: "Диагностика глаз", slug: "eyes" },
  { label: "Диагностика кожи", slug: "skin" },
  { label: "Диагностика тела и осанки", slug: "body" },
];

interface HeaderProps {
  activeItem?: string;
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = ({ activeItem, cartCount }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [diagDropdown, setDiagDropdown] = useState(false);
  const [diagClosing, setDiagClosing] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileDiagOpen, setMobileDiagOpen] = useState(false);
  const dropdownTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
      dropdownTimeout.current = null;
    }
    setDiagClosing(false);
    setDiagDropdown(true);
  };

  const handleMouseLeave = () => {
    setDiagClosing(true);
    dropdownTimeout.current = setTimeout(() => {
      setDiagDropdown(false);
      setDiagClosing(false);
    }, 300);
  };

  const closeMobileMenu = useCallback(() => {
    setMobileMenu(false);
    setMobileDiagOpen(false);
  }, []);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => { if (u) setIsAuthenticated(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenu]);

  return (
    <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between relative z-50">
      <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
        <img src="/logo.svg" alt="Коосмо" className="h-7 md:h-8 w-auto" />
        <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-lg md:text-xl">
          Harmony Spa
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden lg:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          item.label === "Диагностика" ? (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span
                onClick={() => navigate(item.path)}
                className={`px-4 py-1.5 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors inline-block whitespace-nowrap ${
                  activeItem === item.label
                    ? "bg-[#a6856d] text-white border-[#a6856d]"
                    : "border-[#00000033] text-[#000000b2] hover:bg-[#a6856d] hover:text-white hover:border-transparent"
                }`}
              >
                {item.label}
              </span>
              {diagDropdown && (
                <div className={`absolute top-full left-0 bg-white rounded-[15px] shadow-lg py-3 px-2 min-w-[200px] z-50 ${diagClosing ? 'animate-fadeOut' : 'animate-fadeInDown'}`}>
                  {DIAG_OPTIONS.map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => { navigate(`/diagnostics/${d.slug}`); setDiagDropdown(false); setDiagClosing(false); }}
                      className="block w-full text-left px-4 py-2 rounded-[10px] bg-transparent text-[#6B5744] hover:bg-[#f5e6d3] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-sm transition-colors"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`px-4 py-1.5 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors inline-block whitespace-nowrap ${
                activeItem === item.label
                  ? "bg-[#a6856d] text-white border-[#a6856d]"
                  : "border-[#00000033] text-[#000000b2] hover:bg-[#a6856d] hover:text-white hover:border-transparent"
              }`}
            >
              {item.label}
            </span>
          )
        ))}
      </nav>

      {/* Right buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
              title="Корзина"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount !== undefined && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#a6856d] text-white text-xs rounded-full flex items-center justify-center [font-family:'Vela_Sans',sans-serif]">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
              title="Личный кабинет"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="flex h-[34px] items-center justify-center px-6 bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors no-underline"
          >
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white text-sm sm:text-base">Вход</span>
          </Link>
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenu(!mobileMenu)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] bg-transparent cursor-pointer hover:border-[#a6856d] transition-all duration-200"
          aria-label={mobileMenu ? "Закрыть меню" : "Открыть меню"}
        >
          <div className="relative w-5 h-5">
            <span className={`absolute left-0 w-5 h-[2px] bg-[#000000b2] rounded-full transition-all duration-300 ${mobileMenu ? "top-[9px] rotate-45" : "top-[3px]"}`} />
            <span className={`absolute left-0 top-[9px] w-5 h-[2px] bg-[#000000b2] rounded-full transition-all duration-300 ${mobileMenu ? "opacity-0 scale-0" : "opacity-100"}`} />
            <span className={`absolute left-0 w-5 h-[2px] bg-[#000000b2] rounded-full transition-all duration-300 ${mobileMenu ? "top-[9px] -rotate-45" : "top-[15px]"}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenu && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile menu panel */}
      {mobileMenu && (
        <div className="lg:hidden fixed top-0 right-0 w-[85vw] max-w-[360px] h-full bg-[#faf5ef] z-50 shadow-2xl animate-slideDown overflow-y-auto no-scrollbar">
          {/* Mobile menu header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#e3cbb1]/40">
            <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg">
              Меню
            </span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#e3cbb1]/30 border-0 cursor-pointer hover:bg-[#e3cbb1]/60 transition-colors"
              aria-label="Закрыть меню"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Mobile navigation items */}
          <div className="flex flex-col px-4 py-4 gap-1">
            {NAV_ITEMS.map((item, i) => (
              item.label === "Диагностика" ? (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileDiagOpen(!mobileDiagOpen)}
                    className={`animate-slideDownItem w-full flex items-center justify-between px-4 py-3.5 rounded-[14px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-[15px] transition-all ${
                      activeItem === item.label
                        ? "bg-[#a6856d] text-white"
                        : "bg-transparent text-[#6B5744] hover:bg-[#e3cbb1]/40"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e3cbb1]/40">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l4.58-4.58c.94-.94.94-2.48 0-3.42L9 5z"/><circle cx="6" cy="9" r="1"/>
                        </svg>
                      </span>
                      {item.label}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform duration-200 ${mobileDiagOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {mobileDiagOpen && (
                    <div className="ml-6 mt-1 mb-2 flex flex-col gap-0.5 animate-fadeInDown">
                      {DIAG_OPTIONS.map((d) => (
                        <button
                          key={d.slug}
                          onClick={() => { navigate(`/diagnostics/${d.slug}`); closeMobileMenu(); }}
                          className="w-full text-left px-4 py-2.5 rounded-[10px] bg-transparent text-[#6B5744]/80 hover:bg-[#e3cbb1]/30 border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-sm transition-colors"
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); closeMobileMenu(); }}
                  className={`animate-slideDownItem w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-[15px] transition-all ${
                    activeItem === item.label
                      ? "bg-[#a6856d] text-white"
                      : "bg-transparent text-[#6B5744] hover:bg-[#e3cbb1]/40"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full ${activeItem === item.label ? "bg-white/20" : "bg-[#e3cbb1]/40"}`}>
                    {item.label === "Анализы" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    )}
                    {item.label === "Самомассаж" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    )}
                    {item.label === "Трансляции" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    )}
                    {item.label === "Тибетские чаши" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/>
                      </svg>
                    )}
                    {item.label === "Психология" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    )}
                  </span>
                  {item.label}
                </button>
              )
            ))}
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-[#e3cbb1]/40" />

          {/* Mobile bottom actions */}
          <div className="flex flex-col px-4 py-4 gap-1">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => { navigate("/profile"); closeMobileMenu(); }}
                  className="animate-slideDownItem w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-[15px] text-[#6B5744] bg-transparent hover:bg-[#e3cbb1]/40 transition-all"
                  style={{ animationDelay: "350ms" }}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#a6856d]/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  Личный кабинет
                </button>
                <button
                  onClick={() => { navigate("/cart"); closeMobileMenu(); }}
                  className="animate-slideDownItem w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-[15px] text-[#6B5744] bg-transparent hover:bg-[#e3cbb1]/40 transition-all"
                  style={{ animationDelay: "400ms" }}
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#a6856d]/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </span>
                  Корзина
                  {cartCount !== undefined && cartCount > 0 && (
                    <span className="ml-auto w-6 h-6 bg-[#a6856d] text-white text-xs rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => { navigate("/login"); closeMobileMenu(); }}
                className="animate-slideDownItem w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-[14px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-[15px] bg-[#a6856d] text-white hover:bg-[#8d6e58] transition-all"
                style={{ animationDelay: "350ms" }}
              >
                Войти в аккаунт
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
