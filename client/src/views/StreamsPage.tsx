import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../services/api";
import Header from "../components/Header";

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
  previewUrl?: string | null;
  stoppedAt?: string | null;
}

interface HistoryStream extends Stream {
  purchasers: { id: number; login: string; fullName: string; email: string; phone: string; purchasedAt: string }[];
  viewers: { id: number; login: string; fullName: string; email: string; phone: string }[];
}


const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
};

const StreamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formError, setFormError] = useState("");
  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  const [formPrice, setFormPrice] = useState<string>("0");
  const [formPreviewUrl, setFormPreviewUrl] = useState<string>("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryStream[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((user: any) => {
        if (!user) return;
        setIsAuthenticated(true);
        if (user.isAdmin) {
          setIsAdmin(true);
          API.streamRoom.getHistory().then(setHistory).catch(() => {});
        }
        API.streamRoom.getMy().then((my: any[]) => setJoinedIds(my.map((s: any) => s.id))).catch(() => {});
      })
      .catch(() => {});
    loadStreams();
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
    setFormPrice("0");
    setFormPreviewUrl("");
    setPreviewFile(null);
    setShowModal(true);
  };

  const openEditModal = (stream: Stream) => {
    setEditingStream(stream);
    setFormTitle(stream.title);
    setFormDesc(stream.description);
    setFormDate(stream.date);
    setFormTime(stream.time);
    setFormError("");
    setFormPrice(String(stream.price || 0));
    setFormPreviewUrl(stream.previewUrl || "");
    setPreviewFile(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formDate || !formTime) {
      setFormError("Заполните обязательные поля");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    setUploadProgress(null);
    try {
      let saved: any;
      const payload = { title: formTitle.trim(), description: formDesc.trim(), date: formDate, time: formTime, price: Number(formPrice) || 0, previewUrl: formPreviewUrl || null };
      if (editingStream) {
        saved = await API.streams.update(editingStream.id, payload);
      } else {
        saved = await API.streams.create(payload);
      }
      if (previewFile && (saved?.id || editingStream?.id)) {
        const targetId = saved?.id || (editingStream as Stream).id;
        setUploadProgress(0);
        await API.streams.uploadPreview(targetId, previewFile, (pct) => setUploadProgress(pct));
      }
      setShowModal(false);
      loadStreams();
    } catch (e: any) {
      setFormError(e.message || "Ошибка");
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
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
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header activeItem="Трансляции" />

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
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-4xl md:text-[48px] tracking-[-2px] leading-tight mb-4">
          Прямые трансляции
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base max-w-[550px] mx-auto">
          Расписание предстоящих прямых трансляций. Присоединяйтесь к занятиям онлайн из любой точки мира.
        </p>
      </section>

      {/* Admin button */}
      {isAdmin && (
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 pt-6 flex justify-end">
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
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 py-8 pb-20">
        {streams.length === 0 ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base text-center py-10">
            Трансляции пока не запланированы.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {streams.map((stream) => (
              <div key={stream.id} className="bg-[#efdec5] rounded-[20px] p-4 sm:p-6 border border-[#C9A882]">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
                      stream.price > 0 ? "bg-[#a6856d] text-white" : "bg-[#d4edda] text-[#155724]"
                    }`}>
                      {stream.price > 0 ? `${stream.price} ₽` : "Бесплатно"}
                    </span>
                    {stream.previewUrl ? (
                      <button
                        type="button"
                        onClick={() => setShowPreview(stream.previewUrl!)}
                        className="h-9 px-4 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors"
                      >
                        Обзор
                      </button>
                    ) : null}
                    {stream.isLive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 [font-family:'Vela_Sans',sans-serif] font-light text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE
                      </span>
                    ) : stream.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 text-gray-600 [font-family:'Vela_Sans',sans-serif] font-light text-xs">
                        Завершена
                      </span>
                    ) : null}
                    {/* Join/Watch buttons — hide for completed streams */}
                    {isAuthenticated && !isAdmin && stream.status !== 'completed' && (
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

      {/* Admin history */}
      {isAdmin && (
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 pb-10">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 mb-4 bg-transparent border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showHistory ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            История трансляций ({history.length})
          </button>
          {showHistory && (
            <div className="flex flex-col gap-3">
              {history.length === 0 ? (
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm">Завершённых трансляций нет.</p>
              ) : history.map((hs) => (
                <div key={hs.id} className="bg-[#f5e6d3] rounded-[16px] p-4 border border-[#C9A882]/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                      <h4 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">{hs.title}</h4>
                      <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs">
                        {formatDate(hs.date)} {hs.time} — Завершена{hs.stoppedAt ? ` ${new Date(hs.stoppedAt + 'Z').toLocaleString('ru-RU')}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs">
                        Купили: {hs.purchasers.length} · Смотрели: {hs.viewers.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedHistory(expandedHistory === hs.id ? null : hs.id)}
                        className="h-8 px-3 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs cursor-pointer hover:bg-[#f5e6d3] transition-colors"
                      >
                        {expandedHistory === hs.id ? 'Скрыть' : 'Подробнее'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm('Восстановить трансляцию? Она снова станет доступна для купивших пользователей.')) return;
                          await API.streamRoom.restore(hs.id);
                          loadStreams();
                          const updated = await API.streamRoom.getHistory();
                          setHistory(updated);
                        }}
                        className="h-8 px-3 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs border-0 cursor-pointer transition-colors"
                      >
                        Восстановить
                      </button>
                    </div>
                  </div>
                  {expandedHistory === hs.id && (
                    <div className="mt-3 pt-3 border-t border-[#C9A882]/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h5 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm mb-2">Купили ({hs.purchasers.length})</h5>
                          {hs.purchasers.length === 0 ? (
                            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-xs">Нет покупок</p>
                          ) : (
                            <ul className="list-none p-0 m-0 flex flex-col gap-1">
                              {hs.purchasers.map(u => (
                                <li key={u.id} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs bg-white/50 rounded-lg px-3 py-2">
                                  <span className="font-normal">{u.fullName || u.login}</span>
                                  {u.phone && <span className="ml-2 text-[#6B5744]/60">{u.phone}</span>}
                                  {u.email && <span className="ml-2 text-[#6B5744]/60">{u.email}</span>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <h5 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm mb-2">Смотрели ({hs.viewers.length})</h5>
                          {hs.viewers.length === 0 ? (
                            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-xs">Нет зрителей</p>
                          ) : (
                            <ul className="list-none p-0 m-0 flex flex-col gap-1">
                              {hs.viewers.map(u => (
                                <li key={u.id} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs bg-white/50 rounded-lg px-3 py-2">
                                  <span className="font-normal">{u.fullName || u.login}</span>
                                  {u.phone && <span className="ml-2 text-[#6B5744]/60">{u.phone}</span>}
                                  {u.email && <span className="ml-2 text-[#6B5744]/60">{u.email}</span>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { if (!isSaving) setShowModal(false); }} />
          <div className="relative bg-[#f5e6d3] rounded-[25px] p-6 sm:p-8 w-[90vw] max-w-[420px] shadow-2xl">
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
              <div className="flex gap-3">
                <label className="flex-1">
                  <span className="block mb-1 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">Цена (₽, 0 — бесплатно)</span>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">Видео-обзор (URL или загрузка файла)</span>
                <input
                  type="url"
                  placeholder="https://... (необязательно)"
                  value={formPreviewUrl}
                  onChange={(e) => setFormPreviewUrl(e.target.value)}
                  className="h-10 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                  className="[font-family:'Vela_Sans',sans-serif] text-xs"
                />
              </div>
            </div>
            {formError && (
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm mb-4">{formError}</p>
            )}
            {uploadProgress !== null && (
              <div className="w-full mb-4">
                <div className="flex justify-between mb-1">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs">Загрузка видео...</span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#C9A882]/30 rounded-full overflow-hidden">
                  <div className="h-full bg-[#a6856d] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                {uploadProgress === 100 && (
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs mt-1 block">Конвертация видео на сервере...</span>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className={`flex-1 h-11 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors ${
                  isSaving ? 'bg-[#a6856d]/50 text-white/70 cursor-not-allowed' : 'bg-[#a6856d] hover:bg-[#8d6e58] text-white'
                }`}
              >
                {isSaving ? (uploadProgress !== null ? 'Загрузка...' : 'Сохранение...') : (editingStream ? "Сохранить" : "Создать")}
              </button>
              <button
                type="button"
                onClick={() => { if (!isSaving) setShowModal(false); }}
                disabled={isSaving}
                className={`flex-1 h-11 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f5e6d3]'
                }`}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPreview(null)} />
          <div className="relative bg-black rounded-xl overflow-hidden w-[90vw] max-w-[900px] aspect-video shadow-2xl">
            {showPreview.endsWith('.mp4') || showPreview.includes('/uploads/') ? (
              <video
                src={showPreview.startsWith('http') ? showPreview : `${BASE_URL}${showPreview}`}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe src={showPreview} title="Обзор" allow="autoplay; encrypted-media" className="w-full h-full"></iframe>
            )}
            <button onClick={() => setShowPreview(null)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 text-[#6B5744]">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamsPage;
