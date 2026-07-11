import React, { useEffect, useState } from "react";

const STORAGE_KEY = "adblockBannerClosed";

const AdBlockBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Если пользователь уже закрывал баннер в текущей сессии, не показываем
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

    let cancelled = false;

    const detect = async () => {
      try {
        const res = await fetch(
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
          { method: "HEAD", mode: "no-cors", cache: "no-store" }
        );
        // fetch succeeded — no blocker
        void res;
      } catch {
        // fetch blocked — AdBlock is active
        if (!cancelled) setVisible(true);
      }
    };

    detect();
    return () => { cancelled = true; };
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[480px]">
      <div className="bg-[#faf6f1] border border-[#e3cbb1] rounded-[20px] shadow-xl px-6 py-5 flex gap-4 items-start">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f5e6d3] flex items-center justify-center mt-0.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm mb-1">
            Обнаружен блокировщик рекламы
          </p>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-xs leading-relaxed">
            Блокировщик рекламы может замедлять работу сайта или мешать некоторым функциям. Рекомендуем отключить его для этого сайта.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f0e6d8] transition-colors border-0 bg-transparent cursor-pointer"
          aria-label="Закрыть"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AdBlockBanner;
