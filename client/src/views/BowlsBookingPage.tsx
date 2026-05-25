import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface Slot {
  id: number;
  date: string;
  time: string;
  isBooked: number;
  city?: string;
}

type City = "biysk" | "novosibirsk";

const cityLabels: Record<City, string> = {
  biysk: "Бийск",
  novosibirsk: "Новосибирск",
};

const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
};

const BowlsBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => {
        setFullName(u.fullName || "");
        setPhone(u.phone || "");
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const loadSlots = (city: City) => {
    setLoading(true);
    setSelectedSlot(null);
    API.bowlsSchedule.getAvailable(city)
      .then(setSlots)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    loadSlots(city);
  };

  const grouped: Record<string, Slot[]> = {};
  slots.forEach((s) => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });

  const handleBook = async () => {
    if (!selectedSlot) return;
    if (!fullName.trim() || !phone.trim()) {
      setError("Заполните ФИО и телефон");
      return;
    }
    try {
      await API.bowlsSchedule.book(selectedSlot.id, fullName, phone);
      API.activity.log("Запись на тибетские чаши", `${cityLabels[selectedCity!]}, ${selectedSlot.date} ${selectedSlot.time}`);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Ошибка записи");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#efdec5] flex items-center justify-center px-4">
        <div className="bg-white rounded-[30px] p-10 max-w-[440px] w-full text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#d4edda] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#155724" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-3">Запись подтверждена!</h2>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm mb-6">
            Вы записаны на массаж тибетскими чашами в 4 руки ({selectedCity && cityLabels[selectedCity]}): {selectedSlot && `${formatDate(selectedSlot.date)}, ${selectedSlot.time}`}
          </p>
          <Link to="/tibetan-bowls" className="inline-flex h-10 px-6 items-center bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm no-underline hover:bg-[#8d6e58]">
            Вернуться
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efdec5] px-4 sm:px-6 md:px-10 py-8 sm:py-10">
      <div className="max-w-[700px] mx-auto">
        <Link to="/tibetan-bowls" className="inline-flex items-center gap-2 text-[#6B5744] no-underline [font-family:'Vela_Sans',sans-serif] font-light text-sm mb-8 hover:text-[#a6856d]">
          ← Тибетские чаши
        </Link>

        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-3xl md:text-[36px] tracking-[-1px] mb-2">
          Запись на сеанс
        </h1>

        {/* Info block */}
        <div className="bg-[#f7ead8] rounded-[20px] p-6 border border-[#C9A882] mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#a6856d]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </span>
            <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">
              Массаж тибетскими чашами в 4 руки
            </span>
          </div>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-[1.7]">
            Уникальная процедура, в которой два мастера одновременно работают с вашим телом, используя тибетские поющие чаши. 
            Четыре руки создают симметричное воздействие, усиливая целебный эффект вибраций и обеспечивая максимально глубокое расслабление. 
            Длительность сеанса: 60 минут.
          </p>
        </div>

        {/* City selection */}
        <div className="mb-8">
          <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">
            Выберите город
          </h3>
          <div className="flex gap-4">
            {(["biysk", "novosibirsk"] as City[]).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCitySelect(city)}
                className={`flex-1 h-14 rounded-[16px] [font-family:'Vela_Sans',sans-serif] font-normal text-base border-2 cursor-pointer transition-all ${
                  selectedCity === city
                    ? "bg-[#a6856d] text-white border-[#a6856d] shadow-lg"
                    : "bg-white/70 text-[#6B5744] border-[#C9A882] hover:border-[#a6856d] hover:bg-[#f7ead8]"
                }`}
              >
                {cityLabels[city]}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        {selectedCity && (
          <>
            {loading ? (
              <div className="text-center py-16 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50">Загрузка расписания...</div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-16">
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base">
                  Нет доступных слотов в городе {cityLabels[selectedCity]}
                </p>
              </div>
            ) : (
              <>
                <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">
                  Расписание — {cityLabels[selectedCity]}
                </h3>
                <div className="space-y-4 mb-8">
                  {Object.entries(grouped).map(([date, dateSlots]) => (
                    <div key={date} className="bg-white/70 rounded-[20px] p-5 border border-[#e3cbb1]/40">
                      <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-3 capitalize">
                        {formatDate(date)}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {dateSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`h-9 px-4 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors ${
                              selectedSlot?.id === slot.id
                                ? "bg-[#a6856d] text-white border-[#a6856d]"
                                : "bg-white text-[#6B5744] border-[#e3cbb1] hover:border-[#a6856d]"
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="bg-white/80 rounded-[20px] p-6 border border-[#e3cbb1]/40">
                    <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-4">
                      Подтвердите запись на {formatDate(selectedSlot.date)}, {selectedSlot.time}
                    </h3>
                    <div className="flex flex-col gap-3 mb-5">
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="ФИО"
                        className="h-11 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                      />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Телефон"
                        className="h-11 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                      />
                    </div>
                    {error && <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-500 text-xs mb-3">{error}</p>}
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
          </>
        )}
      </div>
    </div>
  );
};

export default BowlsBookingPage;
