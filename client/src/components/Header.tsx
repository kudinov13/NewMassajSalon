import React, { useState, useEffect } from "react";
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
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => { if (u) setIsAuthenticated(true); })
      .catch(() => {});
  }, []);

  return (
    <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between relative z-20">
      <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
        <img src="/logo.svg" alt="Коосмо" className="h-7 md:h-8 w-auto" />
        <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-lg md:text-xl">
          Harmony Spa
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden lg:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => item.label === "Диагностика" && setDiagDropdown(true)}
            onMouseLeave={() => item.label === "Диагностика" && setDiagDropdown(false)}
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
            {item.label === "Диагностика" && diagDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-[15px] shadow-lg py-3 px-2 min-w-[200px] z-50">
                {DIAG_OPTIONS.map((d) => (
                  <button
                    key={d.slug}
                    onClick={() => { navigate(`/diagnostics/${d.slug}`); setDiagDropdown(false); }}
                    className="block w-full text-left px-4 py-2 rounded-[10px] bg-transparent text-[#6B5744] hover:bg-[#f5e6d3] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-sm transition-colors"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
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
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] bg-transparent cursor-pointer hover:border-[#a6856d] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round">
            {mobileMenu ? (
              <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg rounded-b-[20px] p-4 z-50">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => { navigate(item.path); setMobileMenu(false); }}
                className={`w-full text-left px-4 py-3 rounded-[12px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-base transition-colors ${
                  activeItem === item.label
                    ? "bg-[#a6856d] text-white"
                    : "bg-[#f5efe8] text-[#6B5744] hover:bg-[#ece3d5]"
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Diagnostics sub-items in mobile */}
            <div className="pl-4 flex flex-col gap-1">
              {DIAG_OPTIONS.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => { navigate(`/diagnostics/${d.slug}`); setMobileMenu(false); }}
                  className="w-full text-left px-4 py-2 rounded-[10px] bg-transparent text-[#6B5744]/70 hover:bg-[#f5e6d3] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-sm transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
