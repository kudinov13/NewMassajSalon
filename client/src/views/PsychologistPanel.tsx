import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface Slot {
  id: number;
  date: string;
  time: string;
  isBooked: number;
}

interface Appointment {
  id: number;
  userId: number;
  date: string;
  time: string;
  status: string;
  roomId: string;
  psychologistJoined: number;
  userFullName: string;
  userPhone: string;
  userLogin?: string;
}

type Tab = "schedule" | "appointments";

const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
};

const statusLabels: Record<string, string> = {
  booked: "Забронировано",
  in_progress: "Идёт приём",
  completed: "Завершено",
  cancelled: "Отменено",
};
const statusColors: Record<string, string> = {
  booked: "bg-[#f5e6d3] text-[#a6856d]",
  in_progress: "bg-[#d4edda] text-[#155724]",
  completed: "bg-[#e8ddd3] text-[#6B5744]",
  cancelled: "bg-red-100 text-red-600",
};

const timeOptions = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
];

const PsychologistPanel: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("schedule");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTimes, setNewTimes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => {
        if (!u.isPsychologist) navigate("/");
        setUser(u);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (tab === "schedule") API.schedule.getAll().then(setSlots).catch(() => {});
    if (tab === "appointments") API.appointments.getMy().then(setAppointments).catch(() => {});
  }, [tab]);

  const handleAddSlots = async () => {
    if (!newDate || !newTimes.length) { setError("Выберите дату и время"); return; }
    try {
      setError("");
      await API.schedule.create({ date: newDate, times: newTimes });
      setNewTimes([]);
      API.schedule.getAll().then(setSlots);
    } catch (e: any) { setError(e.message || "Ошибка"); }
  };

  const handleDeleteSlot = async (id: number) => {
    try { await API.schedule.delete(id); API.schedule.getAll().then(setSlots); }
    catch (e: any) { alert(e.message); }
  };

  const handleStart = async (a: Appointment) => {
    try {
      const res = await API.appointments.start(a.id);
      navigate(`/room/${res.roomId}`);
    } catch (e: any) { alert(e.message); }
  };

  const handleComplete = async (id: number) => {
    await API.appointments.complete(id);
    API.appointments.getMy().then(setAppointments);
  };

  const toggleTime = (t: string) => {
    setNewTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  // Group slots by date
  const groupedSlots: Record<string, Slot[]> = {};
  slots.forEach((s) => {
    if (!groupedSlots[s.date]) groupedSlots[s.date] = [];
    groupedSlots[s.date].push(s);
  });

  // Date limits
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isLastWeek = now.getDate() > lastDay - 7;
  const minDate = now.toISOString().split("T")[0];
  let maxDate: string;
  if (isLastWeek) {
    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);
    maxDate = nextMonthEnd.toISOString().split("T")[0];
  } else {
    const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    maxDate = thisMonthEnd.toISOString().split("T")[0];
  }

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      <header className="w-full px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">Harmony Spa</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">{user?.fullName || user?.login}</span>
          <Link to="/profile" className="w-9 h-9 rounded-full bg-[#a6856d] flex items-center justify-center no-underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-10 pb-16">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl tracking-[-1px] mb-6">
          Панель психолога
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["schedule", "appointments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-10 px-6 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border cursor-pointer transition-colors ${
                tab === t ? "bg-[#a6856d] text-white border-[#a6856d]" : "bg-white/70 text-[#6B5744] border-[#e3cbb1] hover:border-[#a6856d]"
              }`}
            >
              {t === "schedule" ? "Расписание" : "Записи клиентов"}
            </button>
          ))}
        </div>

        {/* SCHEDULE TAB */}
        {tab === "schedule" && (
          <div>
            {/* Add slots */}
            <div className="bg-white/70 rounded-[20px] p-6 mb-6">
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">Добавить слоты</h3>
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm mb-1">Дата</label>
                  <input
                    type="date"
                    value={newDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {timeOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTime(t)}
                    className={`h-9 px-4 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border cursor-pointer transition-colors ${
                      newTimes.includes(t) ? "bg-[#a6856d] text-white border-[#a6856d]" : "bg-white text-[#6B5744] border-[#e3cbb1] hover:border-[#a6856d]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {error && <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm mb-3">{error}</p>}
              <button
                onClick={handleAddSlots}
                className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
              >
                Добавить
              </button>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-xs mt-3">
                {isLastWeek
                  ? "Сейчас последняя неделя месяца — можно выставлять расписание на следующий месяц"
                  : "Расписание можно выставлять только на текущий месяц. На следующий — в последнюю неделю"}
              </p>
            </div>

            {/* Current slots */}
            <div className="bg-white/70 rounded-[20px] p-6">
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">Текущее расписание</h3>
              {Object.keys(groupedSlots).length === 0 ? (
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Слотов нет</p>
              ) : (
                Object.entries(groupedSlots).map(([date, daySlots]) => (
                  <div key={date} className="mb-4 last:mb-0">
                    <h4 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-2 capitalize">{formatDate(date)}</h4>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((s) => (
                        <div
                          key={s.id}
                          className={`h-9 px-4 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm flex items-center gap-2 ${
                            s.isBooked ? "bg-[#f5e6d3] text-[#a6856d]" : "bg-white border border-[#e3cbb1] text-[#6B5744]"
                          }`}
                        >
                          {s.time}
                          {s.isBooked ? (
                            <span className="text-xs opacity-60">занят</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteSlot(s.id)}
                              className="w-5 h-5 rounded-full bg-red-100 border-0 cursor-pointer flex items-center justify-center hover:bg-red-200 transition-colors text-red-500 text-xs"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {tab === "appointments" && (
          <div className="bg-white/70 rounded-[20px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e3cbb1]/40">
                  <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Дата и время</th>
                  <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Клиент</th>
                  <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Телефон</th>
                  <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Статус</th>
                  <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {appointments.filter(a => a.status !== "cancelled").map((a) => (
                  <tr key={a.id} className="border-b border-[#e3cbb1]/20 last:border-0">
                    <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
                      {formatDate(a.date)}, {a.time}
                    </td>
                    <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">{a.userFullName || a.userLogin || "—"}</td>
                    <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">{a.userPhone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs ${statusColors[a.status] || ""}`}>
                        {statusLabels[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {a.status === "booked" && (
                          <button
                            onClick={() => handleStart(a)}
                            className="h-8 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs border-0 cursor-pointer transition-colors"
                          >
                            Начать приём
                          </button>
                        )}
                        {a.status === "in_progress" && (
                          <>
                            <button
                              onClick={() => navigate(`/room/${a.roomId}`)}
                              className="h-8 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs border-0 cursor-pointer transition-colors"
                            >
                              Войти в комнату
                            </button>
                            <button
                              onClick={() => handleComplete(a.id)}
                              className="h-8 px-4 bg-transparent border border-[#e3cbb1] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs cursor-pointer hover:bg-[#f5e6d3] transition-colors"
                            >
                              Завершить
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {appointments.filter(a => a.status !== "cancelled").length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Записей нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologistPanel;
