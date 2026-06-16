import React, { useEffect, useState } from "react";

const LoadingScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#efdec5] flex items-center justify-center animate-fadeIn pointer-events-none">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-[#a6856d] rounded-full animate-pulse"></div>
          <div className="absolute inset-2 border-4 border-[#C9A882] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-4 border-4 border-[#e3cbb1] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl mb-2 animate-slideUp">
          Коосмо
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-base animate-slideUp" style={{ animationDelay: '0.2s' }}>
          Загрузка...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
