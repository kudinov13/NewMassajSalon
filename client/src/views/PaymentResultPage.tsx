import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const PaymentResultPage: React.FC<{ success: boolean }> = ({ success }) => {
  const [params] = useSearchParams();
  const orderId = params.get("order");

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Коосмо
          </span>
        </Link>
      </header>

      <div className="px-4 sm:px-6 md:px-10 pb-16 flex items-center justify-center" style={{ minHeight: "calc(100vh - 90px)" }}>
        <div className="bg-white rounded-[25px] p-8 sm:p-12 text-center max-w-[480px] w-full">
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              success ? "bg-[#e8f0e4]" : "bg-[#f5e4e0]"
            }`}
          >
            {success ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b8f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b06050" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
          </div>

          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl sm:text-3xl mb-3">
            {success ? "Оплата прошла успешно" : "Оплата не прошла"}
          </h1>

          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-base mb-8">
            {success
              ? `Спасибо за покупку!${orderId ? ` Заказ №${orderId} оплачен.` : ""} Информация о заказе доступна в личном кабинете.`
              : "К сожалению, платёж не был завершён. Вы можете попробовать оплатить заказ ещё раз из истории покупок."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {success ? (
              <Link
                to="/purchase-history"
                className="inline-flex h-11 px-8 items-center justify-center bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-base no-underline transition-colors"
              >
                Мои покупки
              </Link>
            ) : (
              <Link
                to="/purchase-history"
                className="inline-flex h-11 px-8 items-center justify-center bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-base no-underline transition-colors"
              >
                Повторить оплату
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex h-11 px-8 items-center justify-center bg-transparent border border-[#00000033] hover:border-[#a6856d] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-base no-underline transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
