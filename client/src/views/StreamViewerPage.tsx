import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface ChatMsg { id: number; userLogin: string; message: string; }

const mergeMessages = (prev: ChatMsg[], incoming: ChatMsg[]): ChatMsg[] => {
  const seen = new Set(prev.map(m => m.id));
  const fresh = incoming.filter(m => !seen.has(m.id));
  return fresh.length ? [...prev, ...fresh] : prev;
};

const StreamViewerPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const id = parseInt(streamId || "0");

  const [stream, setStream] = useState<any>(null);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [user, setUser] = useState<any>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pollRef = useRef<number>(0);
  const chatPollRef = useRef<number>(0);
  const lastSignalIdRef = useRef(0);
  const lastChatIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const u = await API.user.getCurrentUser();
        setUser(u);
        const s = await API.streamRoom.getRoom(id);
        setStream(s);
        // Notify broadcaster we joined
        await API.streamRoom.sendSignal(id, "viewer-join", {}, 0);
        startSignaling();
        startChatPoll();
      } catch (e: any) {
        setError(e.message || "Ошибка доступа");
      }
    })();
    return () => {
      mountedRef.current = false;
      pcRef.current?.close();
      if (pollRef.current) clearTimeout(pollRef.current);
      if (chatPollRef.current) clearTimeout(chatPollRef.current);
    };
  }, [id]);

  const startSignaling = () => {
    const poll = async () => {
      if (!mountedRef.current) return;
      try {
        const signals = await API.streamRoom.getSignals(id, lastSignalIdRef.current);
        for (const sig of signals) {
          lastSignalIdRef.current = sig.id;
          if (sig.type === "offer") {
            const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            pcRef.current?.close();
            pcRef.current = pc;

            pc.ontrack = (e) => {
              if (remoteVideoRef.current && e.streams[0]) {
                remoteVideoRef.current.srcObject = e.streams[0];
                remoteVideoRef.current.play().catch(() => {});
                if (mountedRef.current) setConnected(true);
              }
            };
            pc.oniceconnectionstatechange = () => {
              const st = pc.iceConnectionState;
              if (mountedRef.current && (st === "connected" || st === "completed")) setConnected(true);
              if (mountedRef.current && (st === "failed" || st === "disconnected" || st === "closed")) setConnected(false);
            };
            pc.onicecandidate = (e) => {
              if (e.candidate) {
                API.streamRoom.sendSignal(id, "ice-candidate", e.candidate, sig.senderId).catch(() => {});
              }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await API.streamRoom.sendSignal(id, "answer", answer, sig.senderId);
          } else if (sig.type === "ice-candidate") {
            const pc = pcRef.current;
            if (pc) try { await pc.addIceCandidate(new RTCIceCandidate(sig.data)); } catch {}
          }
        }
      } catch {}
      if (mountedRef.current) pollRef.current = window.setTimeout(poll, 1500);
    };
    poll();
  };

  const startChatPoll = () => {
    const poll = async () => {
      if (!mountedRef.current) return;
      try {
        const msgs: ChatMsg[] = await API.streamRoom.getChat(id, lastChatIdRef.current);
        if (msgs.length) {
          lastChatIdRef.current = Math.max(lastChatIdRef.current, msgs[msgs.length - 1].id);
          setChatMessages(prev => mergeMessages(prev, msgs));
        }
      } catch {}
      if (mountedRef.current) chatPollRef.current = window.setTimeout(poll, 2000);
    };
    poll();
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      const msg: ChatMsg = await API.streamRoom.sendChat(id, chatInput.trim());
      setChatMessages(prev => mergeMessages(prev, [msg]));
      lastChatIdRef.current = Math.max(lastChatIdRef.current, msg.id);
      setChatInput("");
    } catch {}
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const toggleMute = () => {
    const v = remoteVideoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    setMuted(next);
    v.play().catch(() => {});
  };

  if (error) {
    return (
      <div className="bg-[#efdec5] min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-[20px] border border-[#e3cbb1]/40 px-10 py-8">
          <p className="[font-family:'Vela_Sans',sans-serif] text-[#6B5744] text-lg mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#efdec5] min-h-screen flex flex-col">
      {/* Top */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl">
            {stream?.title || "Прямой эфир"}
          </span>
        </div>
        <button onClick={() => navigate(-1)} className="h-9 px-4 bg-white hover:bg-[#f5e6d3] border border-[#e3cbb1] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors">
          Выйти
        </button>
      </div>

      <div className="flex flex-1 gap-6 px-6 pb-6">
        {/* Video */}
        <div className="flex-1">
          <div className="bg-[#f0ebe5] rounded-[20px] overflow-hidden relative min-h-[400px] h-full flex items-center justify-center">
            <video ref={remoteVideoRef} autoPlay playsInline muted={muted} className="absolute inset-0 w-full h-full object-contain" />
            {/* Status badge */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <span className={`px-3 py-1 rounded-full text-white [font-family:'Vela_Sans',sans-serif] text-xs font-light flex items-center gap-1 ${connected ? "bg-red-500" : "bg-[#6B5744]"}`}>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-white animate-pulse" : "bg-red-400"}`}></span>
                {connected ? "В эфире" : "Офлайн"}
              </span>
            </div>
            {/* Unmute button */}
            {connected && muted && (
              <button
                onClick={toggleMute}
                className="absolute bottom-4 left-4 z-10 h-9 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
                Включить звук
              </button>
            )}
            {connected && !muted && (
              <button
                onClick={toggleMute}
                className="absolute bottom-4 left-4 z-10 w-9 h-9 bg-white/80 hover:bg-white text-[#6B5744] rounded-full border border-[#e3cbb1] cursor-pointer transition-colors flex items-center justify-center"
                title="Выключить звук"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              </button>
            )}
            {!connected && (
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[#a6856d]/20 border-t-[#a6856d]/70 animate-spin mx-auto mb-4"></div>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">Подключение к трансляции...</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="w-[300px] bg-white rounded-[20px] border border-[#e3cbb1]/40 flex flex-col max-h-[620px]">
          <div className="p-4 border-b border-[#e3cbb1]/30">
            <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">Чат комментариев</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/40 text-xs py-10">Сообщений пока нет</div>
            )}
            {chatMessages.map(m => (
              <div key={m.id}>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-xs">{m.userLogin}</span>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mt-0.5">{m.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-[#e3cbb1]/30 flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Введите сообщение..."
              className="flex-1 h-9 px-3 rounded-full border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
            />
            <button onClick={sendMessage} className="w-9 h-9 rounded-full bg-[#a6856d] border-0 flex items-center justify-center cursor-pointer hover:bg-[#8d6e58] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamViewerPage;
