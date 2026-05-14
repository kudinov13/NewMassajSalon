import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

type Order = {
  id: number;
  total: number;
  createdAt: string;
  items: { name: string; price: number; quantity: number }[];
};

const PurchaseHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => { if (!u) navigate("/login"); })
      .catch(() => navigate("/login"));
    API.cart.getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Harmony Spa
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-[34px] items-center justify-center px-6 bg-transparent border border-[#00000033] rounded-[25px] hover:border-[#a6856d] transition-colors no-underline"
          >
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-base">
              Назад
            </span>
          </Link>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-10 pb-16 max-w-[700px] mx-auto">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl sm:text-3xl md:text-4xl tracking-[-1px] mb-8">
          История покупок
        </h1>

        {loading ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-lg text-center py-16">
            Загрузка...
          </p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[25px] p-8 text-center">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-lg mb-4">
              У вас пока нет покупок
            </p>
            <Link
              to="/shop"
              className="inline-flex h-10 px-6 items-center bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-sm no-underline transition-colors"
            >
              Перейти в магазин
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-base">
                      Заказ #{order.id}
                    </span>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000066] text-sm ml-3">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-lg">
                    {order.total} ₽
                  </span>
                </div>
                <div className="border-t border-[#f0e8dd] pt-3 flex flex-col gap-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-sm">
                        {item.name}
                      </span>
                      <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">
                        {item.quantity} x {item.price} ₽ = {item.price * item.quantity} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;
