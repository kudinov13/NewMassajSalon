import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface Stream {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  isLive: number;
  status: string;
  speaker: string;
}

const navItems = [
  "Диагностика",
  "Анализы",
  "Самомассаж",
  "Прямые трансляции",
  "Тибетские чаши",
  "Психология",
];

const diagOptions = [
  { label: "Диагностика ногтей", slug: "nails" },
  { label: "Диагностика языка", slug: "tongue" },
  { label: "Диагностика глаз", slug: "eyes" },
  { label: "Диагностика кожи", slug: "skin" },
  { label: "Диагностика тела и осанки", slug: "body" },
];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
};

const StreamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [diagDropdown, setDiagDropdown] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formError, setFormError] = useState("");
  const [joinedIds, setJoinedIds] = useState<number[]>([]);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((user: any) => {
        setIsAuthenticated(true);
        if (user.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
    loadStreams();
    API.streamRoom.getMy().then((my: any[]) => setJoinedIds(my.map((s: any) => s.id))).catch(() => {});
  }, []);

  const loadStreams = async () => {
    try {
      const data = await API.streams.getAll();
      setStreams(data);
    } catch {}
  };

  const openCreateModal = () => {
    setEditingStream(null);
    setFormTitle("");
    setFormDesc("");
    setFormDate("");
    setFormTime("");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (stream: Stream) => {
    setEditingStream(stream);
    setFormTitle(stream.title);
    setFormDesc(stream.description);
    setFormDate(stream.date);
    setFormTime(stream.time);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formDate || !formTime) {
      setFormError("Заполните обязательные поля");
      return;
    }
    try {
      if (editingStream) {
        await API.streams.update(editingStream.id, { title: formTitle.trim(), description: formDesc.trim(), date: formDate, time: formTime });
      } else {
        await API.streams.create({ title: formTitle.trim(), description: formDesc.trim(), date: formDate, time: formTime });
      }
      setShowModal(false);
      loadStreams();
    } catch (e: any) {
      setFormError(e.message || "Ошибка");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить трансляцию?")) return;
    try {
      await API.streams.delete(id);
      loadStreams();
    } catch {}
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      {/* Header */}
      <header className="w-full px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Harmony Spa
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item}
              className="relative"
              onMouseEnter={() => item === "Диагностика" && setDiagDropdown(true)}
              onMouseLeave={() => item === "Диагностика" && setDiagDropdown(false)}
            >
              <span
                onClick={() => {
                  if (item === "Тибетские чаши") navigate("/tibetan-bowls");
                  if (item === "Самомассаж") navigate("/shop?category=self-massage");
                  if (item === "Диагностика") navigate("/diagnostics/nails");
                  if (item === "Анализы") navigate("/analyses");
                  if (item === "Прямые трансляции") navigate("/streams");
                  if (item === "Психология") navigate("/psychology");
                }}
                className={`px-4 py-1.5 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors inline-block ${
                  item === "Прямые трансляции"
                    ? "bg-[#a6856d] text-white border-transparent"
                    : "border-[#00000033] text-[#000000b2] hover:bg-[#a6856d] hover:text-white hover:border-transparent"
                }`}
              >
                {item}
              </span>
              {item === "Диагностика" && diagDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-[15px] shadow-lg py-3 px-2 min-w-[200px] z-50">
                  {diagOptions.map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => { navigate(`/diagnostics/${d.slug}`); setDiagDropdown(false); }}
                      className="block w-full text-left px-4 py-2 rounded-[10px] bg-transparent text-[#6B5744] hover:bg-[#f5e6d3] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-sm transition-colors"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Корзина"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </Link>
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Профиль"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            </>
          ) : (
            <Link to="/login" className="flex h-[34px] items-center justify-center px-6 bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors no-underline">
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white text-base">Вход</span>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[900px] mx-auto text-center pt-16 pb-6 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e3cbb1]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </span>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base">
            Онлайн-занятия
          </span>
        </div>
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[48px] tracking-[-2px] leading-tight mb-4">
          Прямые трансляции
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base max-w-[550px] mx-auto">
          Расписание предстоящих прямых трансляций. Присоединяйтесь к занятиям онлайн из любой точки мира.
        </p>
      </section>

      {/* Admin button */}
      {isAdmin && (
        <div className="max-w-[1100px] mx-auto px-10 pt-6 flex justify-end">
          <button
            type="button"
            onClick={openCreateModal}
            className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
          >
            + Добавить трансляцию
          </button>
        </div>
      )}

      {/* Streams list */}
      <section className="max-w-[1100px] mx-auto px-10 py-8 pb-20">
        {streams.length === 0 ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base text-center py-10">
            Трансляции пока не запланированы.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {streams.map((stream) => (
              <div key={stream.id} className="bg-[#efdec5] rounded-[20px] p-6 border border-[#C9A882]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#a6856d]/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                      </span>
                      <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg">
                        {stream.title}
                      </h3>
                    </div>
                    {stream.description && (
                      <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm mb-3 ml-12">
                        {stream.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 ml-12">
                      <span className="flex items-center gap-1.5 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(stream.date)}
                      </span>
                      <span className="flex items-center gap-1.5 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {stream.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Price badge */}
                    <span className={`inline-block px-3 py-1 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs ${
                      stream.price > 0 ? "bg-[#a6856d]/10 text-[#a6856d]" : "bg-[#d4edda] text-[#155724]"
                    }`}>
                      {stream.price > 0 ? `${stream.price} ₽` : "Бесплатно"}
                    </span>
                    {stream.isLive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 [font-family:'Vela_Sans',sans-serif] font-light text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE
                      </span>
                    ) : null}
                    {/* Join/Watch buttons */}
                    {isAuthenticated && !isAdmin && (
                      joinedIds.includes(stream.id) ? (
                        stream.isLive ? (
                          <button onClick={() => navigate(`/stream/${stream.id}`)} className="h-9 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                            Смотреть
                          </button>
                        ) : (
                          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#a6856d] text-xs">Вы записаны</span>
                        )
                      ) : (
                        <button
                          onClick={async () => {
                            await API.streamRoom.join(stream.id);
                            setJoinedIds(prev => [...prev, stream.id]);
                          }}
                          className="h-9 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
                        >
                          {stream.price > 0 ? "Купить" : "Записаться"}
                        </button>
                      )
                    )}
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModal(stream)}
                          className="h-9 px-4 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(stream.id)}
                          className="h-9 px-4 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-red-50 transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#f5e6d3] rounded-[25px] p-8 w-[420px] shadow-2xl">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-6">
              {editingStream ? "Редактировать трансляцию" : "Новая трансляция"}
            </h3>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Название трансляции *"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
              />
              <textarea
                placeholder="Описание (необязательно)"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                className="px-4 py-3 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] resize-none"
              />
              <div className="flex gap-3">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                />
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-[120px] h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                />
              </div>
            </div>
            {formError && (
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm mb-4">{formError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
              >
                {editingStream ? "Сохранить" : "Создать"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 h-11 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamsPage;
