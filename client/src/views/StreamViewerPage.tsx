import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface ChatMsg { id: number; userLogin: string; message: string; }

const StreamViewerPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const id = parseInt(streamId || "0");

  const [stream, setStream] = useState<any>(null);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
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
                if (mountedRef.current) setConnected(true);
              }
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
        const msgs = await API.streamRoom.getChat(id, lastChatIdRef.current);
        if (msgs.length) {
          lastChatIdRef.current = msgs[msgs.length - 1].id;
          setChatMessages(prev => [...prev, ...msgs]);
        }
      } catch {}
      if (mountedRef.current) chatPollRef.current = window.setTimeout(poll, 2000);
    };
    poll();
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      const msg = await API.streamRoom.sendChat(id, chatInput.trim());
      setChatMessages(prev => [...prev, msg]);
      setChatInput("");
    } catch {}
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  if (error) {
    return (
      <div className="bg-[#1a1a2e] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="[font-family:'Vela_Sans',sans-serif] text-white/80 text-lg mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="h-10 px-6 bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer">
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] min-h-screen flex flex-col">
      {/* Top */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-white text-sm">
            {stream?.title || "Трансляция"}
          </span>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white/40 text-xs ml-2">
            {connected ? "Подключено" : "Ожидание потока..."}
          </span>
        </div>
        <button onClick={() => navigate(-1)} className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
          Выйти
        </button>
      </div>

      <div className="flex flex-1 gap-4 px-6 pb-6">
        {/* Video */}
        <div className="flex-1 bg-[#16213e] rounded-[16px] overflow-hidden relative min-h-[400px]">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
          {!connected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white/60 animate-spin mx-auto mb-4"></div>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-white/40 text-sm">Подключение к трансляции...</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="w-[300px] bg-[#16213e] rounded-[16px] flex flex-col">
          <div className="p-4 border-b border-white/10">
            <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-white text-sm">Чат</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
            {chatMessages.length === 0 && (
              <div className="text-center [font-family:'Vela_Sans',sans-serif] font-light text-white/30 text-xs py-10">Будьте первым!</div>
            )}
            {chatMessages.map(m => (
              <div key={m.id}>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-xs">{m.userLogin}</span>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-white/80 text-sm mt-0.5">{m.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Сообщение..."
              className="flex-1 h-9 px-3 rounded-full bg-[#1a1a2e] border border-white/20 text-white [font-family:'Vela_Sans',sans-serif] font-light text-sm outline-none placeholder:text-white/30"
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
