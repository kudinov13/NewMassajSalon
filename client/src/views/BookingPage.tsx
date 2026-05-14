import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface Slot {
  id: number;
  date: string;
  time: string;
  isBooked: number;
}

const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
};

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => {
        setUser(u);
        setFullName(u.fullName || "");
        setPhone(u.phone || "");
      })
      .catch(() => navigate("/login"));
    API.schedule.getAvailable()
      .then(setSlots)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  // Group slots by date
  const grouped: Record<string, Slot[]> = {};
  slots.forEach((s) => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });

  // Filter out slots that are less than 2h from now (for today)
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const isSlotAvailable = (s: Slot) => {
    if (s.date === today) {
      const [h, m] = s.time.split(":").map(Number);
      return h * 60 + m - nowMinutes >= 120;
    }
    return true;
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    if (!fullName.trim() || !phone.trim()) {
      setError("Заполните ФИО и телефон");
      return;
    }
    try {
      setError("");
      await API.appointments.book({ slotId: selectedSlot.id, fullName: fullName.trim(), phone: phone.trim() });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Ошибка при записи");
    }
  };

  if (success) {
    return (
      <div className="bg-[#efdec5] min-h-screen w-full flex flex-col">
        <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6">
          <Link to="/" className="flex items-center gap-2 no-underline w-fit">
            <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
            <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">Harmony Spa</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white/70 rounded-[25px] p-10 text-center max-w-[500px]">
            <div className="w-16 h-16 rounded-full bg-[#a6856d] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-3">Вы записаны!</h2>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/80 text-base mb-6">
              Консультация: {formatDate(selectedSlot!.date)} в {selectedSlot!.time}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/profile")} className="h-11 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                Личный кабинет
              </button>
              <button onClick={() => navigate("/psychology")} className="h-11 px-6 bg-transparent border border-[#a6856d] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#a6856d1a] transition-colors">
                Назад
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">Harmony Spa</span>
        </Link>
        <button onClick={() => navigate("/psychology")} className="h-9 px-5 bg-transparent border border-[#00000033] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-sm cursor-pointer hover:border-[#a6856d] transition-colors">
          ← Назад
        </button>
      </header>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 md:px-10 pb-16">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-3xl tracking-[-1px] mb-2">
          Запись на консультацию
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-base mb-8">
          Выберите удобную дату и время
        </p>

        {loading ? (
          <div className="text-center py-10 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60">Загрузка...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white/70 rounded-[20px] p-10 text-center">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base">Нет доступных слотов для записи</p>
          </div>
        ) : (
          <>
            {/* Slots */}
            <div className="space-y-6 mb-8">
              {Object.entries(grouped).map(([date, daySlots]) => (
                <div key={date}>
                  <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-3 capitalize">
                    {formatDate(date)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((s) => {
                      const available = isSlotAvailable(s);
                      const selected = selectedSlot?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          disabled={!available}
                          onClick={() => setSelectedSlot(s)}
                          className={`h-10 px-5 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border cursor-pointer transition-colors ${
                            selected
                              ? "bg-[#a6856d] text-white border-[#a6856d]"
                              : available
                              ? "bg-white/70 text-[#6B5744] border-[#e3cbb1] hover:border-[#a6856d]"
                              : "bg-[#e3cbb1]/30 text-[#6B5744]/30 border-transparent cursor-not-allowed"
                          }`}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Booking form */}
            {selectedSlot && (
              <div className="bg-white/70 rounded-[20px] p-8">
                <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">
                  Запись: {formatDate(selectedSlot.date)} в {selectedSlot.time}
                </h3>
                <div className="flex flex-col gap-3 mb-5">
                  <input
                    placeholder="ФИО *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                  />
                  <input
                    placeholder="Телефон *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                  />
                </div>
                {error && (
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm mb-3">{error}</p>
                )}
                <button
                  onClick={handleBook}
                  className="h-11 px-8 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
                >
                  Записаться
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
