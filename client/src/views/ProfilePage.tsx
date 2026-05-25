import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

type User = {
  id: number;
  login: string;
  isAdmin: number;
  isPsychologist?: number;
  isBowlsSpecialist?: number;
  fullName?: string;
  phone?: string;
};

type Appointment = {
  id: number;
  date: string;
  time: string;
  status: string;
  roomId: string;
  psychologistJoined: number;
};

const statusLabels: Record<string, string> = {
  booked: "Забронировано",
  in_progress: "Идёт приём",
  completed: "Завершено",
  cancelled: "Отменено",
};

const formatDate = (d: string) => {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [myStreams, setMyStreams] = useState<any[]>([]);
  const [diagAppointments, setDiagAppointments] = useState<any[]>([]);
  const [diagRoomStatus, setDiagRoomStatus] = useState<Record<number, {roomActive: boolean; adminInRoom: boolean}>>({});

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => {
        if (u) setUser(u);
        else navigate("/login");
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
    API.appointments.getMy().then(setAppointments).catch(() => {});
    API.streamRoom.getMy().then(setMyStreams).catch(() => {});
    API.diagnostics.getMyAppointments().then(setDiagAppointments).catch(() => {});
  }, [navigate]);

  // Check room status for diagnostics appointments
  useEffect(() => {
    const checkRoomStatuses = async () => {
      const statuses: Record<number, {roomActive: boolean; adminInRoom: boolean}> = {};
      for (const a of diagAppointments) {
        try {
          const status = await API.diagnostics.getRoomStatus(a.id);
          statuses[a.id] = status;
        } catch {}
      }
      setDiagRoomStatus(statuses);
    };
    checkRoomStatuses();
    const interval = setInterval(checkRoomStatuses, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [diagAppointments]);

  const handleLogout = async () => {
    try {
      await API.auth.logout();
      navigate("/");
    } catch {}
  };

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
            to="/cart"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
            title="Корзина"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </Link>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-10 pb-16 max-w-[600px] mx-auto">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl sm:text-3xl md:text-4xl tracking-[-1px] mb-8">
          Личный кабинет
        </h1>

        <div className="bg-white rounded-[25px] p-8">
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-[#a6856d] flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl">
                {user?.login}
              </h2>
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">
                {user?.isAdmin ? "Администратор" : user?.isPsychologist ? "Психолог" : user?.isBowlsSpecialist ? "Специалист по тибетским чашам" : "Пользователь"}
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3 mb-8">
            <Link
              to="/cart"
              className="flex items-center gap-3 px-5 py-3 bg-[#f5efe8] rounded-[15px] no-underline hover:bg-[#ece3d5] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-base">
                Моя корзина
              </span>
            </Link>
            <Link
              to="/shop"
              className="flex items-center gap-3 px-5 py-3 bg-[#f5efe8] rounded-[15px] no-underline hover:bg-[#ece3d5] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-base">
                Магазин
              </span>
            </Link>
            <Link
              to="/my-courses"
              className="flex items-center gap-3 px-5 py-3 bg-[#f5efe8] rounded-[15px] no-underline hover:bg-[#ece3d5] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-base">
                Мои курсы
              </span>
            </Link>
            <Link
              to="/purchase-history"
              className="flex items-center gap-3 px-5 py-3 bg-[#f5efe8] rounded-[15px] no-underline hover:bg-[#ece3d5] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-base">
                История покупок
              </span>
            </Link>
            {user?.isAdmin ? (
              <Link to="/admin" className="flex items-center gap-3 px-5 py-3 bg-[#a6856d1a] rounded-[15px] no-underline cursor-pointer hover:bg-[#a6856d33] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-base">
                  Панель администратора
                </span>
              </Link>
            ) : null}
            {user?.isPsychologist ? (
              <Link to="/psychologist" className="flex items-center gap-3 px-5 py-3 bg-[#a6856d1a] rounded-[15px] no-underline cursor-pointer hover:bg-[#a6856d33] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-base">
                  Панель психолога
                </span>
              </Link>
            ) : null}
            {user?.isBowlsSpecialist ? (
              <Link to="/bowls-specialist" className="flex items-center gap-3 px-5 py-3 bg-[#a6856d1a] rounded-[15px] no-underline cursor-pointer hover:bg-[#a6856d33] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                </svg>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-base">
                  Панель тибетских чаш
                </span>
              </Link>
            ) : null}
          </div>

          {/* Appointments */}
          {(appointments.filter(a => a.status !== 'cancelled').length > 0 || diagAppointments.length > 0) && (
            <div className="mt-6">
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-lg mb-3">Мои записи</h3>
              <div className="flex flex-col gap-2">
                {appointments.filter(a => a.status !== 'cancelled').map(a => {
                  const now = new Date();
                  const [h, m] = a.time.split(':').map(Number);
                  const apptTime = new Date(a.date + 'T00:00:00');
                  apptTime.setHours(h, m, 0, 0);
                  const diffMin = (apptTime.getTime() - now.getTime()) / 60000;
                  const canJoin = a.status === 'in_progress' || (a.status === 'booked' && diffMin <= 2 && a.psychologistJoined);
                  return (
                    <div key={a.id} className="flex items-center justify-between px-4 py-3 bg-[#f5efe8] rounded-[12px]">
                      <div>
                        <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">
                          Психолог: {formatDate(a.date)} в {a.time}
                        </span>
                        <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs ml-2">
                          {statusLabels[a.status] || a.status}
                        </span>
                      </div>
                      {canJoin && (
                        <Link to={`/room/${a.roomId}`} className="h-8 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs flex items-center no-underline transition-colors">
                          Зайти на приём
                        </Link>
                      )}
                    </div>
                  );
                })}
                {diagAppointments.map(a => {
                  const now = new Date();
                  const [h, m] = a.time.split(':').map(Number);
                  const apptTime = new Date(a.date + 'T00:00:00');
                  apptTime.setHours(h, m, 0, 0);
                  const diffMin = (apptTime.getTime() - now.getTime()) / 60000;
                  const status = diagRoomStatus[a.id] || { roomActive: false, adminInRoom: false };
                  const canJoin = status.roomActive && status.adminInRoom && a.roomId;
                  return (
                    <div key={a.id} className="flex items-center justify-between px-4 py-3 bg-[#f5efe8] rounded-[12px]">
                      <div>
                        <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">
                          Диагностика: {formatDate(a.date)} в {a.time}
                        </span>
                        {!canJoin && diffMin <= 5 && (
                          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs ml-2">
                            {status.roomActive ? "админ вышел из комнаты" : "ожидание админа"}
                          </span>
                        )}
                      </div>
                      {canJoin && (
                        <Link to={`/room/${a.roomId}`} className="h-8 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs flex items-center no-underline transition-colors">
                          Зайти на приём
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Streams */}
          {myStreams.length > 0 && (
            <div className="mt-6">
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-lg mb-3">Мои трансляции</h3>
              <div className="flex flex-col gap-2">
                {myStreams.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-[#f5efe8] rounded-[12px]">
                    <div>
                      <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">{s.title}</span>
                      <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs ml-2">
                        {formatDate(s.date)} {s.time}
                      </span>
                    </div>
                    {s.isLive ? (
                      <Link to={`/stream/${s.id}`} className="h-8 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs flex items-center no-underline transition-colors">
                        Смотреть
                      </Link>
                    ) : (
                      <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-xs">
                        {s.status === 'completed' ? 'Завершена' : 'Ожидание'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-11 mt-6 bg-transparent border-2 border-[#a6856d] text-[#000000b2] rounded-full [font-family:'Vela_Sans',sans-serif] text-base cursor-pointer hover:bg-[#a6856d] hover:text-white transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
