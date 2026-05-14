import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../services/api";

type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  category: string;
  image: string | null;
};

const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await API.cart.get();
      setItems(data);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    const data = await API.cart.updateQuantity(productId, quantity);
    setItems(data);
  };

  const handleRemove = async (productId: number) => {
    const data = await API.cart.remove(productId);
    setItems(data);
  };

  const handleClear = async () => {
    if (!window.confirm("Очистить корзину?")) return;
    const data = await API.cart.clear();
    setItems(data);
  };

  const handleCheckout = async () => {
    if (!items.length) return;
    try {
      await API.cart.checkout();
      setItems([]);
      alert("Заказ оформлен! Вы можете посмотреть историю покупок в профиле.");
    } catch (e: any) {
      alert(e.message || "Ошибка оформления заказа");
    }
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading) {
    return (
      <div className="bg-[#efdec5] min-h-screen flex items-center justify-center">
        <span className="[font-family:'Vela_Sans',sans-serif] text-[#000000b2] text-lg">Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Harmony Spa
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="flex h-[34px] items-center justify-center px-6 bg-transparent border border-[#00000033] rounded-[25px] hover:border-[#a6856d] transition-colors no-underline"
          >
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-base">
              Магазин
            </span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
            title="Личный кабинет"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-10 pb-16">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl sm:text-3xl md:text-4xl tracking-[-1px] mb-8">
          Корзина
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-lg mb-4">
              Корзина пуста
            </p>
            <Link
              to="/shop"
              className="inline-flex h-11 items-center px-8 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-base no-underline transition-colors"
            >
              Перейти в магазин
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Items list */}
            <div className="flex-1 flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-5 bg-white rounded-[20px] p-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-[15px] overflow-hidden bg-[#f5efe8]">
                    {item.image ? (
                      <img src={`${BASE_URL}${item.image}`} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-[#00000033]">📦</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-base mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {item.oldPrice ? (
                        <>
                          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000066] text-sm line-through">
                            {item.oldPrice} ₽
                          </span>
                          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-base">
                            {item.price} ₽
                          </span>
                        </>
                      ) : (
                        <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-base">
                          {item.price} ₽
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    {item.category !== "self-massage" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-[#e3cbb1] bg-transparent [font-family:'Vela_Sans',sans-serif] text-lg cursor-pointer hover:bg-[#a6856d] hover:text-white hover:border-[#a6856d] transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                    )}
                    <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-base w-6 text-center">
                      {item.quantity}
                    </span>
                    {item.category !== "self-massage" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-[#e3cbb1] bg-transparent [font-family:'Vela_Sans',sans-serif] text-lg cursor-pointer hover:bg-[#a6856d] hover:text-white hover:border-[#a6856d] transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    )}
                  </div>
                  {/* Subtotal */}
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-base w-24 text-right">
                    {item.price * item.quantity} ₽
                  </span>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId)}
                    className="w-8 h-8 flex items-center justify-center bg-transparent border-0 cursor-pointer text-[#00000066] hover:text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="w-[320px] flex-shrink-0">
              <div className="bg-white rounded-[20px] p-6 sticky top-6">
                <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-xl mb-4">
                  Итого
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-base">
                    Товаров: {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-lg">
                    {total} ₽
                  </span>
                </div>
                <div className="border-t border-[#e3cbb1] my-4" />
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-base border-0 cursor-pointer transition-colors mb-3"
                >
                  Оформить заказ
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full h-9 bg-transparent border border-[#e3cbb1] text-[#000000b2] rounded-full [font-family:'Vela_Sans',sans-serif] text-sm cursor-pointer hover:border-[#a6856d] transition-colors"
                >
                  Очистить корзину
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
