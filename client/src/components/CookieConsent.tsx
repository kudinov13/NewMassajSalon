import React, { useState, useEffect } from "react";

const CONSENT_KEY = "privacy_consent_accepted";

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(CONSENT_KEY);
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6">
      <div className="max-w-[600px] mx-auto bg-white border-2 border-[#e3cbb1] rounded-[20px] p-5 sm:p-6 shadow-xl">
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed mb-4">
          Продолжая использовать сайт, вы даёте согласие на обработку персональных данных
          в соответствии с{" "}
          <span className="font-normal">Политикой конфиденциальности</span>.
          Мы используем cookies для корректной работы сайта и улучшения качества обслуживания.
        </p>
        <button
          onClick={handleAccept}
          className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
        >
          Принимаю
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
