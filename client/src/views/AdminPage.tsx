import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../services/api";

type Tab = "dashboard" | "products" | "labs" | "streams" | "live" | "users" | "diagnostics-schedule" | "activity" | "admin-guide";

interface Stream {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  speaker: string;
  status: string;
  price: number;
  isLive: number;
  streamRoomId: string;
}

interface Lab {
  id: number;
  name: string;
  organization: string;
  url: string;
}

interface UserItem {
  id: number;
  login: string;
  isAdmin: number;
  isPsychologist: number;
  isBowlsSpecialist: number;
  fullName: string;
  phone: string;
  email: string;
  createdAt: string;
}

interface Stats {
  users: number;
  products: number;
  streams: number;
  labs: number;
  plannedStreams: number;
}

const statusLabels: Record<string, string> = {
  planned: "Запланирована",
  live: "Идёт",
  completed: "Завершена",
};

const statusColors: Record<string, string> = {
  planned: "bg-[#f5e6d3] text-[#a6856d]",
  live: "bg-[#d4edda] text-[#155724]",
  completed: "bg-[#e8ddd3] text-[#a6856d]",
};

const roleLabels: Record<string, string> = {
  user: "Пользователь",
  admin: "Админ",
  psychologist: "Психолог",
  bowls: "Специалист по тибетским чашам",
};

const formatDate = (d: string) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) + " г.";
};

const sidebarItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "dashboard",
    label: "Дашборд",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: "products",
    label: "Товары",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    key: "labs",
    label: "Лаборатории",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6v7.5L19.5 21H4.5L9 10.5V3z" /><line x1="9" y1="3" x2="15" y2="3" />
      </svg>
    ),
  },
  {
    key: "streams",
    label: "Трансляции",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    key: "live",
    label: "Прямой эфир",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    key: "users",
    label: "Пользователи",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    key: "diagnostics-schedule",
    label: "Расписание диагностики",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    key: "activity",
    label: "Журнал действий",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14" /><circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    key: "admin-guide",
    label: "Инструкция",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
  },
];

const AdminActivityTab: React.FC = () => {
  const [log, setLog] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const load = (q?: string) => API.activity.getLog(q || "", 200).then(setLog).catch(() => {});
  useEffect(() => { load(); }, []);
  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(search)} placeholder="Поиск по действию, пользователю..." className="flex-1 h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]" />
        <button onClick={() => load(search)} className="h-10 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">Найти</button>
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
            {log.map((a: any) => (
              <tr key={a.id} className="border-b border-[#e3cbb1]/20 last:border-0">
                <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs whitespace-nowrap">{a.createdAt?.replace('T',' ').slice(0,16)}</td>
                <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xs">{a.userFullName || a.userLogin || "—"}</td>
                <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs">{a.action}</td>
                <td className="px-4 py-2 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs">{a.details || "—"}</td>
              </tr>
            ))}
            {log.length === 0 && (<tr><td colSpan={4} className="px-4 py-8 text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Нет записей</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CoursesAdminTab: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCourseId, setVideoCourseId] = useState<number | null>(null);

  const load = () => API.courses.getAll().then(setCourses).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", desc);
    fd.append("price", price || "0");
    if (image) fd.append("image", image);
    await API.courses.create(fd);
    setTitle(""); setDesc(""); setPrice(""); setImage(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить курс?")) return;
    await API.courses.delete(id);
    load();
  };

  const handleUploadVideo = async () => {
    if (!videoCourseId || !videoFile) return;
    const fd = new FormData();
    fd.append("video", videoFile);
    fd.append("title", videoTitle || "Урок");
    await API.courses.uploadVideo(videoCourseId, fd);
    setVideoFile(null); setVideoTitle(""); setVideoCourseId(null);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Create course */}
      <div className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
        <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-4">Создать курс</h3>
        <div className="flex flex-col gap-3 mb-4">
          <input placeholder="Название *" value={title} onChange={e => setTitle(e.target.value)} className="h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]" />
          <textarea placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="px-4 py-3 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] resize-none" />
          <input placeholder="Цена (₽)" value={price} onChange={e => setPrice(e.target.value)} className="h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] w-40" />
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm" />
        </div>
        <button onClick={handleCreate} className="h-9 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
          Создать
        </button>
      </div>

      {/* Upload video */}
      <div className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
        <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-4">Загрузить видео в курс</h3>
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <select
            value={videoCourseId || ""}
            onChange={e => setVideoCourseId(parseInt(e.target.value) || null)}
            className="h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none"
          >
            <option value="">Выберите курс</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input placeholder="Название урока" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none" />
          <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm" />
        </div>
        <button onClick={handleUploadVideo} disabled={!videoCourseId || !videoFile} className="h-9 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors disabled:opacity-40">
          Загрузить видео
        </button>
      </div>

      {/* Course list */}
      <div className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
        <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-4">Все курсы ({courses.length})</h3>
        {courses.length === 0 ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Курсов нет</p>
        ) : (
          <div className="space-y-3">
            {courses.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-[#f5efe8] rounded-[12px]">
                <div className="flex items-center gap-3">
                  {c.image && <img src={`${BASE_URL}${c.image}`} alt="" className="w-10 h-10 rounded-[8px] object-cover" />}
                  <div>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">{c.title}</span>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs ml-2">{c.price > 0 ? `${c.price} ₽` : "Бесплатно"}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="h-8 px-3 border border-red-300 text-red-500 rounded-full bg-transparent [font-family:'Vela_Sans',sans-serif] font-light text-xs cursor-pointer hover:bg-red-50">
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [adminLogin, setAdminLogin] = useState("");

  // Diagnostics schedule
  const [diagSlots, setDiagSlots] = useState<any[]>([]);
  const [diagAppointments, setDiagAppointments] = useState<any[]>([]);
  const [diagTab, setDiagTab] = useState<"slots" | "appointments">("slots");
  const [diagNewDate, setDiagNewDate] = useState("");
  const [diagNewTimes, setDiagNewTimes] = useState<string[]>([]);
  const [diagError, setDiagError] = useState("");

  // Stream modal
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [editStream, setEditStream] = useState<Stream | null>(null);
  const [sTitle, setSTitle] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sDate, setSDate] = useState("");
  const [sTime, setSTime] = useState("");
  const [sSpeaker, setSSpeaker] = useState("");
  const [sStatus, setSStatus] = useState("planned");

  // Lab modal
  const [showLabModal, setShowLabModal] = useState(false);
  const [editLab, setEditLab] = useState<Lab | null>(null);
  const [lName, setLName] = useState("");
  const [lOrg, setLOrg] = useState("");
  const [lUrl, setLUrl] = useState("");

  // Live broadcast state
  const [liveSourceType, setLiveSourceType] = useState<"camera"|"screen">("camera");
  const [liveCameras, setLiveCameras] = useState<MediaDeviceInfo[]>([]);
  const [liveMics, setLiveMics] = useState<MediaDeviceInfo[]>([]);
  const [liveSelectedCamera, setLiveSelectedCamera] = useState("");
  const [liveSelectedMic, setLiveSelectedMic] = useState("");
  const [liveQuality, setLiveQuality] = useState<"480"|"720"|"1080">("720");
  const [liveSelectedStream, setLiveSelectedStream] = useState<number>(0);
  const [liveIsStreaming, setLiveIsStreaming] = useState(false);
  const [liveChatMessages, setLiveChatMessages] = useState<{id:number;userLogin:string;message:string}[]>([]);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const liveLocalStreamRef = useRef<MediaStream|null>(null);
  const livePeersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const livePollRef = useRef<number>(0);
  const liveChatPollRef = useRef<number>(0);
  const liveLastSignalIdRef = useRef(0);
  const liveLastChatIdRef = useRef(0);
  const liveMountedRef = useRef(true);

  const liveRefreshDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch {}
    const devs = await navigator.mediaDevices.enumerateDevices();
    const cams = devs.filter(d => d.kind === "videoinput");
    const mics = devs.filter(d => d.kind === "audioinput");
    setLiveCameras(cams);
    setLiveMics(mics);
    if (cams.length && !liveSelectedCamera) setLiveSelectedCamera(cams[0].deviceId);
    if (mics.length && !liveSelectedMic) setLiveSelectedMic(mics[0].deviceId);
  };

  const liveStartCapture = async () => {
    liveStopCapture();
    if (!liveSelectedStream) return;
    let mediaStream: MediaStream;
    const h = liveQuality === "1080" ? 1080 : liveQuality === "720" ? 720 : 480;
    if (liveSourceType === "screen") {
      mediaStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: { height: { ideal: h } }, audio: true });
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: liveSelectedMic ? { exact: liveSelectedMic } : undefined } });
        micStream.getAudioTracks().forEach(t => mediaStream.addTrack(t));
      } catch {}
    } else {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: liveSelectedCamera ? { exact: liveSelectedCamera } : undefined, height: { ideal: h } },
        audio: { deviceId: liveSelectedMic ? { exact: liveSelectedMic } : undefined },
      });
    }
    liveLocalStreamRef.current = mediaStream;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = mediaStream;
    // Start the stream on server
    await API.streamRoom.start(liveSelectedStream);
    setLiveIsStreaming(true);
    liveStartSignaling();
    liveStartChatPoll();
    API.streams.getAll().then(setStreams);
  };

  const liveStopCapture = () => {
    liveLocalStreamRef.current?.getTracks().forEach(t => t.stop());
    liveLocalStreamRef.current = null;
    livePeersRef.current.forEach(pc => pc.close());
    livePeersRef.current.clear();
    if (livePollRef.current) clearTimeout(livePollRef.current);
    if (liveChatPollRef.current) clearTimeout(liveChatPollRef.current);
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  };

  const liveStopStream = async () => {
    liveStopCapture();
    if (liveSelectedStream) {
      await API.streamRoom.stop(liveSelectedStream);
    }
    setLiveIsStreaming(false);
    API.streams.getAll().then(setStreams);
  };

  const liveCreatePeerForViewer = async (viewerId: number) => {
    if (livePeersRef.current.has(viewerId)) return;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    livePeersRef.current.set(viewerId, pc);
    liveLocalStreamRef.current?.getTracks().forEach(t => { pc.addTrack(t, liveLocalStreamRef.current!); });
    pc.onicecandidate = (e) => { if (e.candidate) API.streamRoom.sendSignal(liveSelectedStream, "ice-candidate", e.candidate, viewerId).catch(()=>{}); };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await API.streamRoom.sendSignal(liveSelectedStream, "offer", offer, viewerId);
  };

  const liveStartSignaling = () => {
    const poll = async () => {
      if (!liveMountedRef.current || !liveIsStreaming) return;
      try {
        const signals = await API.streamRoom.getSignals(liveSelectedStream, liveLastSignalIdRef.current);
        for (const sig of signals) {
          liveLastSignalIdRef.current = sig.id;
          const viewerId = sig.senderId;
          if (sig.type === "viewer-join") { await liveCreatePeerForViewer(viewerId); }
          else if (sig.type === "answer") {
            const pc = livePeersRef.current.get(viewerId);
            if (pc && pc.signalingState === "have-local-offer") await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
          } else if (sig.type === "ice-candidate") {
            const pc = livePeersRef.current.get(viewerId);
            if (pc) try { await pc.addIceCandidate(new RTCIceCandidate(sig.data)); } catch {}
          }
        }
      } catch {}
      if (liveMountedRef.current) livePollRef.current = window.setTimeout(poll, 1500);
    };
    poll();
  };

  const liveStartChatPoll = () => {
    const poll = async () => {
      if (!liveMountedRef.current) return;
      try {
        const msgs = await API.streamRoom.getChat(liveSelectedStream, liveLastChatIdRef.current);
        if (msgs.length) { liveLastChatIdRef.current = msgs[msgs.length - 1].id; setLiveChatMessages(prev => [...prev, ...msgs]); }
      } catch {}
      if (liveMountedRef.current) liveChatPollRef.current = window.setTimeout(poll, 2000);
    };
    poll();
  };

  useEffect(() => { liveMountedRef.current = true; return () => { liveMountedRef.current = false; liveStopCapture(); }; }, []);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u: any) => {
        if (!u.isAdmin) navigate("/");
        setAdminLogin(u.login || "Администратор");
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (tab === "dashboard") API.admin.getStats().then(setStats).catch(() => {});
    if (tab === "streams" || tab === "live") API.streams.getAll().then(setStreams).catch(() => {});
    if (tab === "labs") API.labs.getAll().then(setLabs).catch(() => {});
    if (tab === "users") API.admin.getUsers().then(setUsers).catch(() => {});
    if (tab === "diagnostics-schedule") {
      if (diagTab === "slots") API.diagnostics.getAvailableSlots().then(setDiagSlots).catch(() => {});
      if (diagTab === "appointments") API.diagnostics.getAllAppointments().then(setDiagAppointments).catch(() => {});
    }
  }, [tab, diagTab]);

  // Stream handlers
  const [sPrice, setSPrice] = useState("0");

  const openNewStream = () => {
    setEditStream(null); setSTitle(""); setSDesc(""); setSDate(""); setSTime(""); setSSpeaker(""); setSStatus("planned"); setSPrice("0");
    setShowStreamModal(true);
  };
  const openEditStream = (s: Stream) => {
    setEditStream(s); setSTitle(s.title); setSDesc(s.description); setSDate(s.date); setSTime(s.time); setSSpeaker(s.speaker); setSStatus(s.status); setSPrice(String(s.price || 0));
    setShowStreamModal(true);
  };
  const saveStream = async () => {
    if (!sTitle || !sDate || !sTime) return;
    const data = { title: sTitle, description: sDesc, date: sDate, time: sTime, speaker: sSpeaker, status: sStatus, price: parseFloat(sPrice) || 0 };
    if (editStream) await API.streams.update(editStream.id, data);
    else await API.streams.create(data);
    setShowStreamModal(false);
    API.streams.getAll().then(setStreams);
  };
  const handleStartStream = async (s: Stream) => {
    setLiveSelectedStream(s.id);
    setTab("live");
  };
  // Role change confirmation
  const [pendingRoleChange, setPendingRoleChange] = useState<{userId:number;login:string;oldRole:string;newRole:string}|null>(null);
  const [userSearch, setUserSearch] = useState("");

  const requestRoleChange = (userId: number, login: string, oldRole: string, newRole: string) => {
    if (oldRole === newRole) return;
    setPendingRoleChange({ userId, login, oldRole, newRole });
  };
  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    await API.admin.changeRole(pendingRoleChange.userId, pendingRoleChange.newRole);
    API.admin.getUsers().then(setUsers);
    setPendingRoleChange(null);
  };
  const handleChangeRole = async (userId: number, role: string) => {
    await API.admin.changeRole(userId, role);
    API.admin.getUsers().then(setUsers);
  };
  const deleteStream = async (id: number) => {
    if (!window.confirm("Удалить трансляцию?")) return;
    await API.streams.delete(id);
    API.streams.getAll().then(setStreams);
  };

  // Lab handlers
  const openNewLab = () => {
    setEditLab(null); setLName(""); setLOrg(""); setLUrl("");
    setShowLabModal(true);
  };
  const openEditLab = (l: Lab) => {
    setEditLab(l); setLName(l.name); setLOrg(l.organization); setLUrl(l.url);
    setShowLabModal(true);
  };
  const saveLab = async () => {
    if (!lName || !lOrg || !lUrl) return;
    if (editLab) await API.labs.update(editLab.id, { name: lName, organization: lOrg, url: lUrl });
    else await API.labs.create({ name: lName, organization: lOrg, url: lUrl });
    setShowLabModal(false);
    API.labs.getAll().then(setLabs);
  };
  const deleteLab = async (id: number) => {
    if (!window.confirm("Удалить лабораторию?")) return;
    await API.labs.delete(id);
    API.labs.getAll().then(setLabs);
  };

  // Diagnostics schedule handlers
  const diagTimeOptions = [
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
  ];

  const diagToggleTime = (t: string) => {
    setDiagNewTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleDiagAddSlots = async () => {
    if (!diagNewDate || !diagNewTimes.length) { setDiagError("Выберите дату и время"); return; }
    try {
      setDiagError("");
      await API.diagnostics.create(diagNewDate, diagNewTimes);
      setDiagNewTimes([]);
      API.diagnostics.getAvailableSlots().then(setDiagSlots);
    } catch (e: any) { setDiagError(e.message || "Ошибка"); }
  };

  const handleDiagDeleteSlot = async (id: number) => {
    try { await API.diagnostics.deleteSlot(id); API.diagnostics.getAvailableSlots().then(setDiagSlots); }
    catch (e: any) { alert(e.message); }
  };

  const handleDiagStartAppointment = async (a: any) => {
    try {
      const result = await API.diagnostics.joinRoom(a.id);
      navigate(`/room/${result.roomId}`);
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  // Date limits for diagnostics
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isLastWeek = now.getDate() > lastDay - 7;
  const diagMinDate = now.toISOString().split("T")[0];
  let diagMaxDate: string;
  if (isLastWeek) {
    const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);
    diagMaxDate = nextMonthEnd.toISOString().split("T")[0];
  } else {
    const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    diagMaxDate = thisMonthEnd.toISOString().split("T")[0];
  }

  const diagGroupedSlots: Record<string, any[]> = {};
  diagSlots.forEach((s) => {
    if (!diagGroupedSlots[s.date]) diagGroupedSlots[s.date] = [];
    diagGroupedSlots[s.date].push(s);
  });

  const inputClass = "h-11 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#faf6f1]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full z-50 w-[220px] md:w-[200px] bg-[#faf6f1] border-r border-[#e3cbb1]/50 flex flex-col justify-between py-6 px-4 flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="flex items-center justify-between mb-8 px-2">
            <a href="/" className="flex items-center gap-2 no-underline">
              <img src="/logo.svg" alt="" className="h-6 w-auto" />
              <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">Harmony Spa</span>
            </a>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden w-7 h-7 rounded-full bg-[#e3cbb1]/30 border-0 flex items-center justify-center cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-sm transition-colors w-full text-left ${
                  tab === item.key
                    ? "bg-[#a6856d] text-white"
                    : "bg-transparent text-[#6B5744] hover:bg-[#f5e6d3]"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#a6856d] flex items-center justify-center text-white [font-family:'Vela_Sans',sans-serif] text-xs font-normal">
            A
          </div>
          <div>
            <div className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xs">Администратор</div>
            <div className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-[11px]">{adminLogin}</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 w-full min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-full border border-[#e3cbb1] bg-transparent flex items-center justify-center cursor-pointer hover:bg-[#f5e6d3] transition-colors"
              aria-label="Открыть меню"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl sm:text-2xl">
              {sidebarItems.find((i) => i.key === tab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {tab === "streams" && (
              <button onClick={openNewStream} className="h-10 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                + Добавить в расписание
              </button>
            )}
            <div className="w-9 h-9 rounded-full border border-[#e3cbb1] flex items-center justify-center cursor-pointer hover:bg-[#f5e6d3] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#a6856d] flex items-center justify-center text-white [font-family:'Vela_Sans',sans-serif] text-xs font-normal">
              A
            </div>
          </div>
        </div>

        {/* === DASHBOARD === */}
        {tab === "dashboard" && stats && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">Общая статистика</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Всего пользователей</span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl">{stats.users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Лабораторий</span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl">{stats.labs}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">Магазин</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Всего товаров</span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl">{stats.products}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">Расписание</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Всего трансляций</span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl">{stats.streams}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Запланировано</span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl">{stats.plannedStreams}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === PRODUCTS === */}
        {tab === "products" && (
          <div className="text-center py-20">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base mb-4">Управление товарами доступно на странице магазина</p>
            <button onClick={() => navigate("/shop")} className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
              Перейти в магазин
            </button>
          </div>
        )}

        {/* === LABS === */}
        {tab === "labs" && (
          <div>
            <div className="flex justify-end mb-6">
              <button onClick={openNewLab} className="h-10 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                + Добавить
              </button>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {labs.map((lab) => (
                <div key={lab.id} className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-[12px] bg-[#f5e6d3] flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5"><path d="M9 3h6v7.5L19.5 21H4.5L9 10.5V3z"/></svg>
                    </span>
                    <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">{lab.name}</h3>
                  </div>
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm mb-4">{lab.organization}</p>
                  <div className="flex items-center justify-between">
                    <a href={lab.url} target="_blank" rel="noopener noreferrer" className="[font-family:'Vela_Sans',sans-serif] font-light text-[#a6856d] text-sm no-underline hover:underline flex items-center gap-1">
                      Перейти →
                    </a>
                    <div className="flex gap-1">
                      <button onClick={() => openEditLab(lab)} className="w-8 h-8 rounded-full bg-[#f5e6d3] border-0 cursor-pointer flex items-center justify-center hover:bg-[#e3cbb1] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => deleteLab(lab.id)} className="w-8 h-8 rounded-full bg-[#f5e6d3] border-0 cursor-pointer flex items-center justify-center hover:bg-red-100 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === STREAMS === */}
        {tab === "streams" && (
          <div className="bg-white rounded-[20px] border border-[#e3cbb1]/40 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e3cbb1]/30">
                  <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Название</th>
                  <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Дата</th>
                  <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Цена</th>
                  <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Статус</th>
                  <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {streams.map((s) => (
                  <tr key={s.id} className="border-b border-[#e3cbb1]/20 last:border-0">
                    <td className="px-5 py-4">
                      <div className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">{s.title}</div>
                      <div className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-xs">{s.speaker || ""}</div>
                    </td>
                    <td className="px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">{formatDate(s.date)} {s.time}</td>
                    <td className="px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">{s.price > 0 ? `${s.price} ₽` : "Бесплатно"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs ${statusColors[s.status] || statusColors.planned}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        {s.status === 'planned' && (
                          <button onClick={() => handleStartStream(s)} className="h-7 px-3 bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs border-0 cursor-pointer hover:bg-[#8d6e58] transition-colors" title="Запустить">
                            ▶ Запустить
                          </button>
                        )}
                        {s.status === 'live' && (
                          <button onClick={() => { setLiveSelectedStream(s.id); setTab("live"); }} className="h-7 px-3 bg-[#155724] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs border-0 cursor-pointer hover:bg-[#0d3d18] transition-colors">
                            ◉ В эфире
                          </button>
                        )}
                        <button onClick={() => openEditStream(s)} className="w-7 h-7 rounded-full bg-[#f5e6d3] border-0 cursor-pointer flex items-center justify-center hover:bg-[#e3cbb1] transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => deleteStream(s.id)} className="w-7 h-7 rounded-full bg-[#f5e6d3] border-0 cursor-pointer flex items-center justify-center hover:bg-red-100 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {streams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Трансляции не найдены</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* === LIVE === */}
        {tab === "live" && (
          <div className="flex gap-6">
            <div className="flex-1">
              {/* Video preview */}
              <div className="bg-[#f0ebe5] rounded-[20px] h-[300px] flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                <video ref={liveVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <span className={`px-3 py-1 rounded-full text-white [font-family:'Vela_Sans',sans-serif] text-xs font-light flex items-center gap-1 ${liveIsStreaming ? "bg-red-500" : "bg-[#6B5744]"}`}>
                    <span className={`w-2 h-2 rounded-full ${liveIsStreaming ? "bg-white animate-pulse" : "bg-red-400"}`}></span>
                    {liveIsStreaming ? "В эфире" : "Офлайн"}
                  </span>
                </div>
                {!liveIsStreaming && !liveLocalStreamRef.current && (
                  <div className="relative z-10 flex flex-col items-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-40">
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Предпросмотр видео</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="bg-white rounded-[20px] p-6 border border-[#e3cbb1]/40">
                {/* Source type */}
                <div className="mb-4">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">Выбор источника</span>
                  <div className="flex gap-2 mt-2">
                    <span onClick={() => setLiveSourceType("screen")} className={`px-4 py-2 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm border cursor-pointer transition-colors ${liveSourceType === "screen" ? "bg-[#f5e6d3] border-[#a6856d]" : "bg-white border-[#e3cbb1]"}`}>
                      Экран (ПК / телефон)
                    </span>
                    <span onClick={() => setLiveSourceType("camera")} className={`px-4 py-2 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm border cursor-pointer transition-colors ${liveSourceType === "camera" ? "bg-[#f5e6d3] border-[#a6856d]" : "bg-white border-[#e3cbb1]"}`}>
                      Веб-камера
                    </span>
                  </div>
                </div>

                {/* Stream selection */}
                <div className="mb-4">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Трансляция из расписания</span>
                  <select value={liveSelectedStream} onChange={e => setLiveSelectedStream(Number(e.target.value))} className="mt-1 w-full h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none">
                    <option value={0}>— Выберите трансляцию —</option>
                    {streams.filter(s => s.status === 'planned' || s.status === 'live').map(s => <option key={s.id} value={s.id}>{s.title} ({s.date} {s.time})</option>)}
                  </select>
                </div>

                <div className="flex gap-4 mb-4">
                  {/* Camera selection (only if source=camera) */}
                  {liveSourceType === "camera" && (
                    <div className="flex-1">
                      <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Камера</span>
                      <select value={liveSelectedCamera} onChange={e => setLiveSelectedCamera(e.target.value)} className="mt-1 w-full h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none">
                        {liveCameras.length === 0 && <option>Нет устройств</option>}
                        {liveCameras.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Камера"}</option>)}
                      </select>
                    </div>
                  )}
                  {/* Quality */}
                  <div className="flex-1">
                    <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Качество видео</span>
                    <select value={liveQuality} onChange={e => setLiveQuality(e.target.value as any)} className="mt-1 w-full h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none">
                      <option value="480">480p</option>
                      <option value="720">720p</option>
                      <option value="1080">1080p</option>
                    </select>
                  </div>
                  {/* Mic */}
                  <div className="flex-1">
                    <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">Микрофон</span>
                    <select value={liveSelectedMic} onChange={e => setLiveSelectedMic(e.target.value)} className="mt-1 w-full h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none">
                      {liveMics.length === 0 && <option>Нет устройств</option>}
                      {liveMics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Микрофон"}</option>)}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button onClick={liveRefreshDevices} className="h-10 px-5 bg-transparent border border-[#e3cbb1] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors">
                    ↻ Обновить устройства
                  </button>
                  {!liveIsStreaming ? (
                    <button onClick={liveStartCapture} disabled={!liveSelectedStream} className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                      ▶ Запустить трансляцию
                    </button>
                  ) : (
                    <button onClick={liveStopStream} className="h-10 px-6 bg-red-500 hover:bg-red-600 text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                      ◼ Завершить трансляцию
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="w-[280px] bg-white rounded-[20px] border border-[#e3cbb1]/40 flex flex-col max-h-[620px]">
              <div className="p-4 border-b border-[#e3cbb1]/30">
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">Чат комментариев</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {liveChatMessages.length === 0 && (
                  <div className="text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/40 text-xs py-10">Сообщений пока нет</div>
                )}
                {liveChatMessages.map(m => (
                  <div key={m.id}>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-xs">{m.userLogin}</span>
                    <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mt-0.5">{m.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-[#e3cbb1]/30 flex gap-2">
                <input placeholder="Введите сообщение..." className="flex-1 h-9 px-3 rounded-full border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none" />
                <button className="w-9 h-9 rounded-full bg-[#a6856d] border-0 flex items-center justify-center cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === USERS === */}
        {tab === "users" && (
          <div>
            {/* Search */}
            <div className="mb-4">
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Поиск по ФИО или телефону..."
                className="w-full max-w-[400px] h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
              />
            </div>
            <div className="bg-white rounded-[20px] border border-[#e3cbb1]/40 overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#e3cbb1]/30">
                    <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">ID</th>
                    <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Логин / ФИО</th>
                    <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Телефон</th>
                    <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Email</th>
                    <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Роль</th>
                    <th className="text-left px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (u.fullName || "").toLowerCase().includes(q) || (u.phone || "").includes(q) || u.login.toLowerCase().includes(q);
                    })
                    .map((u) => {
                    const currentRole = u.isAdmin ? 'admin' : u.isPsychologist ? 'psychologist' : u.isBowlsSpecialist ? 'bowls' : 'user';
                    return (
                    <tr key={u.id} className="border-b border-[#e3cbb1]/20 last:border-0">
                      <td className="px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm">#{u.id}</td>
                      <td className="px-5 py-4">
                        <div className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">{u.login}</div>
                        {u.fullName && <div className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-xs">{u.fullName}</div>}
                      </td>
                      <td className="px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">{u.phone || "—"}</td>
                      <td className="px-5 py-4 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">{u.email || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs ${
                          u.isAdmin ? "bg-[#e8ddd3] text-[#6B5744]" : u.isPsychologist ? "bg-[#d4edda] text-[#155724]" : u.isBowlsSpecialist ? "bg-[#e3f2fd] text-[#0d47a1]" : "bg-[#f5e6d3] text-[#a6856d]"
                        }`}>
                          {roleLabels[currentRole]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={currentRole}
                          onChange={(e) => requestRoleChange(u.id, u.login, currentRole, e.target.value)}
                          className="h-8 px-3 rounded-[8px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs outline-none cursor-pointer"
                        >
                          <option value="user">Пользователь</option>
                          <option value="admin">Админ</option>
                          <option value="psychologist">Психолог</option>
                          <option value="bowls">Специалист по тибетским чашам</option>
                        </select>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === DIAGNOSTICS SCHEDULE === */}
        {tab === "diagnostics-schedule" && (
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(["slots", "appointments"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDiagTab(t)}
                  className={`h-10 px-6 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border cursor-pointer transition-colors ${
                    diagTab === t ? "bg-[#a6856d] text-white border-[#a6856d]" : "bg-white/70 text-[#6B5744] border-[#e3cbb1] hover:border-[#a6856d]"
                  }`}
                >
                  {t === "slots" ? "Слоты" : "Записи клиентов"}
                </button>
              ))}
            </div>

            {diagTab === "slots" && (
              <>
                {/* Add slots */}
                <div className="bg-white/70 rounded-[20px] p-6 mb-6">
                  <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">Добавить слоты диагностики</h3>
                  <div className="flex items-end gap-4 mb-4">
                    <div>
                      <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm mb-1">Дата</label>
                      <input
                        type="date"
                        value={diagNewDate}
                        min={diagMinDate}
                        max={diagMaxDate}
                        onChange={(e) => { setDiagNewDate(e.target.value); setDiagNewTimes([]); }}
                        className="h-10 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {diagTimeOptions.map((t) => {
                      const isBooked = diagNewDate && diagSlots.some(s => s.date === diagNewDate && s.time === t && s.isBooked);
                      const isExisting = diagNewDate && diagSlots.some(s => s.date === diagNewDate && s.time === t);
                      return (
                        <button
                          key={t}
                          onClick={() => !isBooked && diagToggleTime(t)}
                          disabled={isBooked ? true : undefined}
                          className={`h-9 px-4 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border cursor-pointer transition-colors ${
                            isBooked
                              ? "bg-[#f5e6d3] text-[#a6856d] border-[#e3cbb1] opacity-60 cursor-not-allowed"
                              : diagNewTimes.includes(t)
                              ? "bg-[#a6856d] text-white border-[#a6856d]"
                              : "bg-white text-[#6B5744] border-[#e3cbb1] hover:border-[#a6856d]"
                          }`}
                        >
                          {t}
                          {isExisting && !isBooked && <span className="text-xs opacity-60 ml-1">создан</span>}
                        </button>
                      );
                    })}
                  </div>
                  {diagError && <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm mb-3">{diagError}</p>}
                  <button
                    onClick={handleDiagAddSlots}
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
                  <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">Текущее расписание диагностики</h3>
                  {Object.keys(diagGroupedSlots).length === 0 ? (
                    <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Слотов нет</p>
                  ) : (
                    Object.entries(diagGroupedSlots).map(([date, daySlots]) => (
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
                                  onClick={() => handleDiagDeleteSlot(s.id)}
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
              </>
            )}

            {diagTab === "appointments" && (
              <div className="bg-white/70 rounded-[20px] overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#e3cbb1]/30">
                      <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Дата и время</th>
                      <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Клиент</th>
                      <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Телефон</th>
                      <th className="text-left px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744]/60 text-sm">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagAppointments.map((a) => (
                      <tr key={a.id} className="border-b border-[#e3cbb1]/20 last:border-0">
                        <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
                          {formatDate(a.date)}, {a.time}
                        </td>
                        <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm">{a.fullName || "—"}</td>
                        <td className="px-5 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">{a.phone || "—"}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleDiagStartAppointment(a)}
                            className="h-8 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs border-0 cursor-pointer transition-colors"
                          >
                            Начать приём
                          </button>
                        </td>
                      </tr>
                    ))}
                    {diagAppointments.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Записей нет</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* === ACTIVITY LOG === */}
        {tab === "activity" && <AdminActivityTab />}

        {/* === ADMIN GUIDE === */}
        {tab === "admin-guide" && (
          <div className="bg-white/70 rounded-[20px] p-6">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-5">Инструкция для администратора</h3>
            <div className="flex flex-col gap-4">
              {[
                { t: "Дашборд", b: "На главной вкладке отображается статистика: количество пользователей, товаров, трансляций и лабораторий." },
                { t: "Товары и курсы", b: "Добавляйте товары через вкладку «Товары». Для курсов — создайте курс, затем загрузите видеоуроки. Каждый товар можно привязать к курсу." },
                { t: "Трансляции", b: "Создавайте и управляйте трансляциями. Загружайте видеообзоры. Запускайте прямой эфир через вкладку «Прямой эфир»." },
                { t: "Пользователи", b: "Управляйте ролями пользователей (админ, психолог, специалист по чашам). Ищите по имени, логину или телефону." },
                { t: "Расписание диагностики", b: "Выставляйте слоты для диагностики по видеосвязи. Начинайте приём через видеоконференцию." },
                { t: "Видеоконференция", b: "В комнате видеозвонка используйте микрофон, камеру и демонстрацию экрана (кнопка с иконкой монитора)." },
                { t: "Журнал действий", b: "Отслеживайте все действия пользователей: записи, покупки, регистрации. Поиск по имени или действию." },
                { t: "Навигация (инструкция для пользователей)", b: "Редактируйте инструкцию для пользователей через /guide — добавляйте, изменяйте или удаляйте пункты." },
              ].map((item, i) => (
                <div key={i} className="bg-[#f7ead8] rounded-[14px] p-4 border border-[#C9A882]/30">
                  <h4 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-sm mb-1">{item.t}</h4>
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed">{item.b}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Stream modal */}
      {showStreamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowStreamModal(false)} />
          <div className="relative bg-[#faf6f1] rounded-[25px] p-8 w-[440px] shadow-2xl">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-6">
              {editStream ? "Редактировать" : "Новая трансляция"}
            </h3>
            <div className="flex flex-col gap-3 mb-6">
              <input placeholder="Название *" value={sTitle} onChange={e => setSTitle(e.target.value)} className={inputClass} />
              <textarea placeholder="Описание" value={sDesc} onChange={e => setSDesc(e.target.value)} rows={2} className="px-4 py-3 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] resize-none" />
              <input placeholder="Спикер" value={sSpeaker} onChange={e => setSSpeaker(e.target.value)} className={inputClass} />
              <div className="flex gap-3">
                <input type="date" value={sDate} onChange={e => setSDate(e.target.value)} className={`flex-1 ${inputClass}`} />
                <input type="time" value={sTime} onChange={e => setSTime(e.target.value)} className={`w-[120px] ${inputClass}`} />
              </div>
              <input placeholder="Цена (0 = бесплатно)" type="number" min="0" value={sPrice} onChange={e => setSPrice(e.target.value)} className={inputClass} />
              <select value={sStatus} onChange={e => setSStatus(e.target.value)} className={inputClass}>
                <option value="planned">Запланирована</option>
                <option value="live">Идет</option>
                <option value="finished">Завершена</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={saveStream} className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                {editStream ? "Сохранить" : "Создать"}
              </button>
              <button onClick={() => setShowStreamModal(false)} className="flex-1 h-11 bg-transparent border border-[#e3cbb1] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab modal */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowLabModal(false)} />
          <div className="relative bg-[#faf6f1] rounded-[25px] p-8 w-[420px] shadow-2xl">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-6">
              {editLab ? "Редактировать" : "Новая лаборатория"}
            </h3>
            <div className="flex flex-col gap-3 mb-6">
              <input placeholder="Название *" value={lName} onChange={e => setLName(e.target.value)} className={inputClass} />
              <input placeholder="Организация *" value={lOrg} onChange={e => setLOrg(e.target.value)} className={inputClass} />
              <input placeholder="Ссылка на сайт *" value={lUrl} onChange={e => setLUrl(e.target.value)} className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button onClick={saveLab} className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                {editLab ? "Сохранить" : "Создать"}
              </button>
              <button onClick={() => setShowLabModal(false)} className="flex-1 h-11 bg-transparent border border-[#e3cbb1] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role change confirmation modal */}
      {pendingRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setPendingRoleChange(null)} />
          <div className="relative bg-[#faf6f1] rounded-[25px] p-8 w-[420px] shadow-2xl">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-4">Подтверждение смены роли</h3>
            <div className="bg-[#f5e6d3] rounded-[12px] p-4 mb-6">
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mb-2">
                Пользователь: <strong>{pendingRoleChange.login}</strong>
              </p>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mb-2">
                Текущая роль: <strong>{roleLabels[pendingRoleChange.oldRole]}</strong>
              </p>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
                Новая роль: <strong className="text-[#a6856d]">{roleLabels[pendingRoleChange.newRole]}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={confirmRoleChange} className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
                Подтвердить
              </button>
              <button onClick={() => setPendingRoleChange(null)} className="flex-1 h-11 bg-transparent border border-[#e3cbb1] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
