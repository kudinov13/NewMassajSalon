import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface ChatMsg { id: number; userLogin: string; message: string; }

const StreamBroadcastPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const id = parseInt(streamId || "0");

  const [stream, setStream] = useState<any>(null);
  const [sourceType, setSourceType] = useState<"camera" | "screen">("camera");
  const [devices, setDevices] = useState<{ cameras: MediaDeviceInfo[]; mics: MediaDeviceInfo[] }>({ cameras: [], mics: [] });
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [quality, setQuality] = useState<"720" | "1080" | "480">("720");
  const [isLive, setIsLive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const pollRef = useRef<number>(0);
  const lastSignalIdRef = useRef(0);
  const lastChatIdRef = useRef(0);
  const chatPollRef = useRef<number>(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    navigator.mediaDevices.enumerateDevices().then((devs) => {
      const cameras = devs.filter(d => d.kind === "videoinput");
      const mics = devs.filter(d => d.kind === "audioinput");
      setDevices({ cameras, mics });
      if (cameras.length) setSelectedCamera(cameras[0].deviceId);
      if (mics.length) setSelectedMic(mics[0].deviceId);
    });
    API.streams.getAll().then((all: any[]) => {
      const s = all.find((x: any) => x.id === id);
      if (s) { setStream(s); setIsLive(!!s.isLive); }
    });
    return () => { mountedRef.current = false; };
  }, [id]);

  const getConstraints = useCallback(() => {
    const h = quality === "1080" ? 1080 : quality === "720" ? 720 : 480;
    return {
      video: sourceType === "camera" ? { deviceId: selectedCamera ? { exact: selectedCamera } : undefined, height: { ideal: h } } : false,
      audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
    };
  }, [sourceType, selectedCamera, selectedMic, quality]);

  const startCapture = async () => {
    stopCapture();
    let stream: MediaStream;
    if (sourceType === "screen") {
      stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: { height: { ideal: parseInt(quality) } }, audio: true });
      // Add mic audio
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined } });
        micStream.getAudioTracks().forEach(t => stream.addTrack(t));
      } catch {}
    } else {
      stream = await navigator.mediaDevices.getUserMedia(getConstraints());
    }
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    setIsLive(true);
    startSignaling();
    startChatPoll();
  };

  const stopCapture = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    if (pollRef.current) clearTimeout(pollRef.current);
    if (chatPollRef.current) clearTimeout(chatPollRef.current);
  };

  const handleStop = async () => {
    stopCapture();
    await API.streamRoom.stop(id);
    setIsLive(false);
    navigate("/admin");
  };

  const handleStart = async () => {
    if (!stream?.isLive) {
      await API.streamRoom.start(id);
      setStream((s: any) => ({ ...s, isLive: 1, status: "live" }));
    }
    await startCapture();
  };

  const createPeerForViewer = async (viewerId: number) => {
    if (peersRef.current.has(viewerId)) return;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peersRef.current.set(viewerId, pc);

    localStreamRef.current?.getTracks().forEach(t => {
      pc.addTrack(t, localStreamRef.current!);
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        API.streamRoom.sendSignal(id, "ice-candidate", e.candidate, viewerId).catch(() => {});
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await API.streamRoom.sendSignal(id, "offer", offer, viewerId);
  };

  const startSignaling = () => {
    const poll = async () => {
      if (!mountedRef.current) return;
      try {
        const signals = await API.streamRoom.getSignals(id, lastSignalIdRef.current);
        for (const sig of signals) {
          lastSignalIdRef.current = sig.id;
          const viewerId = sig.senderId;
          if (sig.type === "viewer-join") {
            await createPeerForViewer(viewerId);
          } else if (sig.type === "answer") {
            const pc = peersRef.current.get(viewerId);
            if (pc && pc.signalingState === "have-local-offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
            }
          } else if (sig.type === "ice-candidate") {
            const pc = peersRef.current.get(viewerId);
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

  useEffect(() => { return () => { stopCapture(); }; }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  return (
    <div className="bg-[#1a1a2e] min-h-screen flex flex-col">
      {/* Top */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {isLive && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>}
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white/80 text-sm">
            {stream?.title || "Трансляция"}
          </span>
        </div>
        <div className="flex gap-2">
          {!isLive ? (
            <button onClick={handleStart} className="h-9 px-5 bg-red-500 hover:bg-red-600 text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
              ▶ Начать трансляцию
            </button>
          ) : (
            <button onClick={handleStop} className="h-9 px-5 bg-red-600 hover:bg-red-700 text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
              ◼ Завершить
            </button>
          )}
          <button onClick={() => navigate("/admin")} className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors">
            Назад
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 px-6 pb-6">
        {/* Main area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Video preview */}
          <div className="flex-1 bg-[#16213e] rounded-[16px] overflow-hidden relative min-h-[400px]">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white/30 text-sm">Превью</span>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-[#16213e] rounded-[16px] p-5">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-white/50 text-xs mb-1">Источник</label>
                <select value={sourceType} onChange={e => setSourceType(e.target.value as any)} className="w-full h-9 px-3 rounded-[8px] bg-[#1a1a2e] border border-white/20 text-white [font-family:'Vela_Sans',sans-serif] font-light text-sm outline-none">
                  <option value="camera">Веб-камера</option>
                  <option value="screen">Экран</option>
                </select>
              </div>
              {sourceType === "camera" && (
                <div>
                  <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-white/50 text-xs mb-1">Камера</label>
                  <select value={selectedCamera} onChange={e => setSelectedCamera(e.target.value)} className="w-full h-9 px-3 rounded-[8px] bg-[#1a1a2e] border border-white/20 text-white [font-family:'Vela_Sans',sans-serif] font-light text-sm outline-none">
                    {devices.cameras.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Камера"}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-white/50 text-xs mb-1">Микрофон</label>
                <select value={selectedMic} onChange={e => setSelectedMic(e.target.value)} className="w-full h-9 px-3 rounded-[8px] bg-[#1a1a2e] border border-white/20 text-white [font-family:'Vela_Sans',sans-serif] font-light text-sm outline-none">
                  {devices.mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Микрофон"}</option>)}
                </select>
              </div>
              <div>
                <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-white/50 text-xs mb-1">Качество</label>
                <select value={quality} onChange={e => setQuality(e.target.value as any)} className="w-full h-9 px-3 rounded-[8px] bg-[#1a1a2e] border border-white/20 text-white [font-family:'Vela_Sans',sans-serif] font-light text-sm outline-none">
                  <option value="480">480p</option>
                  <option value="720">720p</option>
                  <option value="1080">1080p</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="w-[300px] bg-[#16213e] rounded-[16px] flex flex-col">
          <div className="p-4 border-b border-white/10">
            <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-white text-sm">Чат трансляции</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
            {chatMessages.length === 0 && (
              <div className="text-center [font-family:'Vela_Sans',sans-serif] font-light text-white/30 text-xs py-10">Сообщений нет</div>
            )}
            {chatMessages.map(m => (
              <div key={m.id}>
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-xs">{m.userLogin}</span>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-white/80 text-sm mt-0.5">{m.message}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamBroadcastPage;
