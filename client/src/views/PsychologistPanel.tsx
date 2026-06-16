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

interface ActivityItem {
  id: number;
  userId: number;
  userLogin: string;
  userFullName: string;
  action: string;
  details: string;
  createdAt: string;
}

interface UserItem {
  id: number;
  login: string;
  fullName: string;
  phone: string;
}

type Tab = "schedule" | "appointments" | "users" | "activity" | "guide";

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
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [activitySearch, setActivitySearch] = useState("");

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => {
        if (!u?.isPsychologist) { navigate("/"); return; }
        setUser(u);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (tab === "schedule") API.schedule.getAll().then(setSlots).catch(() => {});
    if (tab === "appointments") API.appointments.getMy().then(setAppointments).catch(() => {});
    if (tab === "users") API.activity.getUsers().then(setUsers).catch(() => {});
    if (tab === "activity") API.activity.getLog("", 200).then(setActivityLog).catch(() => {});
  }, [tab]);

  const handleUserSearch = () => API.activity.getUsers(userSearch).then(setUsers).catch(() => {});
  const handleActivitySearch = () => API.activity.getLog(activitySearch, 200).then(setActivityLog).catch(() => {});

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
      <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">
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

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-10 pb-16">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl tracking-[-1px] mb-6">
          Панель психолога
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["schedule", "appointments", "users", "activity", "guide"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-10 px-4 sm:px-5 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs sm:text-sm border cursor-pointer transition-colors whitespace-nowrap ${
                tab === t ? "bg-[#a6856d] text-white border-[#a6856d]" : "bg-white/70 text-[#6B5744] border-[#e3cbb1] hover:border-[#a6856d]"
              }`}
            >
              {t === "schedule" ? "Расписание" : t === "appointments" ? "Записи клиентов" : t === "users" ? "Пользователи" : t === "activity" ? "Журнал действий" : "Инструкция"}
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
          <div className="bg-white/70 rounded-[20px] overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
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
        {/* USERS */}
        {tab === "users" && (
          <div>
            <div className="flex gap-3 mb-4">
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleUserSearch()} placeholder="Поиск по имени, логину или телефону..." className="flex-1 h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]" />
              <button onClick={handleUserSearch} className="h-10 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">Найти</button>
            </div>
            <div className="bg-white/70 rounded-[20px] overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#e3cbb1]/40">
                    <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">ID</th>
                    <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Логин</th>
                    <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">ФИО</th>
                    <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Телефон</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[#e3cbb1]/20 last:border-0">
                      <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm">#{u.id}</td>
                      <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">{u.login}</td>
                      <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">{u.fullName || "—"}</td>
                      <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">{u.phone || "—"}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (<tr><td colSpan={4} className="px-5 py-8 text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Пользователи не найдены</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIVITY */}
        {tab === "activity" && (
          <div>
            <div className="flex gap-3 mb-4">
              <input value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleActivitySearch()} placeholder="Поиск по действию, пользователю..." className="flex-1 h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]" />
              <button onClick={handleActivitySearch} className="h-10 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">Найти</button>
            </div>
            <div className="bg-white/70 rounded-[20px] overflow-hidden max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white/90">
                  <tr className="border-b border-[#e3cbb1]/40">
                    <th className="text-left px-4 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-xs">Время</th>
                    <th className="text-left px-4 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-xs">Пользователь</th>
                    <th className="text-left px-4 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-xs">Действие</th>
                    <th className="text-left px-4 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-xs">Детали</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLog.map((a) => (
                    <tr key={a.id} className="border-b border-[#e3cbb1]/20 last:border-0">
                      <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs whitespace-nowrap">{a.createdAt?.replace('T',' ').slice(0,16)}</td>
                      <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xs">{a.userFullName || a.userLogin || "—"}</td>
                      <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs">{a.action}</td>
                      <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs">{a.details || "—"}</td>
                    </tr>
                  ))}
                  {activityLog.length === 0 && (<tr><td colSpan={4} className="px-4 py-8 text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Нет записей</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GUIDE */}
        {tab === "guide" && (
          <div className="bg-white/70 rounded-[20px] p-6">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-5">Инструкция для психолога</h3>
            <div className="flex flex-col gap-4">
              {[
                { t: "Управление расписанием", b: "Во вкладке «Расписание» выберите дату и отметьте доступное время. Нажмите «Добавить» — слоты появятся для записи клиентов. Удалить можно только незабронированные слоты." },
                { t: "Записи клиентов", b: "Во вкладке «Записи клиентов» отображаются все бронирования. Нажмите «Начать приём» когда подойдёт время — откроется видеоконференция. По завершении нажмите «Завершить»." },
                { t: "Видеоконференция", b: "В комнате видеозвонка доступны: включение/выключение микрофона и камеры, а также демонстрация экрана — нажмите кнопку с иконкой монитора." },
                { t: "Поиск пользователей", b: "Во вкладке «Пользователи» найдите любого зарегистрированного пользователя по имени, логину или телефону для связи." },
                { t: "Журнал действий", b: "Во вкладке «Журнал действий» отслеживайте все действия пользователей на сайте: записи, покупки, регистрации и т.д." },
              ].map((item, i) => (
                <div key={i} className="bg-[#f7ead8] rounded-[14px] p-4 border border-[#C9A882]/30">
                  <h4 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm mb-1">{item.t}</h4>
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed">{item.b}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologistPanel;
