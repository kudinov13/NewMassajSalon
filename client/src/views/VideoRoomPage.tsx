import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../services/api";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const VideoRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenSenderRef = useRef<RTCRtpSender | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pollRef = useRef<number>(0);
  const lastSignalIdRef = useRef<number>(0);
  const isInitiatorRef = useRef(false);
  const mountedRef = useRef(true);

  // Load user and room info
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const u = await API.user.getCurrentUser();
        setUser(u);
        const a = await API.room.get(roomId!);
        setAppointment(a);
        isInitiatorRef.current = a.psychologistId === u.id;
      } catch (e: any) {
        setError(e.message || "Ошибка доступа к комнате");
      }
    })();
    return () => { mountedRef.current = false; };
  }, [roomId]);

  // Start media & WebRTC when appointment loaded
  useEffect(() => {
    if (!appointment || !user || error) return;

    let cleanup = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cleanup) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          if (remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
            if (mountedRef.current) setConnected(true);
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate && roomId) {
            API.room.sendSignal(roomId, "ice-candidate", e.candidate).catch(() => {});
          }
        };

        // Start polling for signals
        const poll = async () => {
          if (cleanup || !roomId) return;
          try {
            const signals = await API.room.getSignals(roomId, lastSignalIdRef.current);
            for (const sig of signals) {
              lastSignalIdRef.current = sig.id;
              if (sig.type === "offer" && pc.signalingState !== "stable") continue;
              if (sig.type === "offer") {
                await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await API.room.sendSignal(roomId, "answer", answer);
              } else if (sig.type === "answer") {
                await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
              } else if (sig.type === "ice-candidate") {
                try { await pc.addIceCandidate(new RTCIceCandidate(sig.data)); } catch {}
              }
            }
          } catch {}
          if (!cleanup) pollRef.current = window.setTimeout(poll, 1000);
        };

        // Initiator creates offer
        if (isInitiatorRef.current) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await API.room.sendSignal(roomId!, "offer", offer);
        }

        poll();
      } catch (e: any) {
        if (mountedRef.current) setError("Не удалось получить доступ к камере/микрофону");
      }
    };

    start();

    return () => {
      cleanup = true;
      if (pollRef.current) clearTimeout(pollRef.current);
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [appointment, user, error, roomId]);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setMicOn((v) => !v);
  }, []);

  const toggleCam = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setCamOn((v) => !v);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    if (screenSharing) {
      // Stop screen share, revert to camera
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack && screenSenderRef.current) {
        await screenSenderRef.current.replaceTrack(camTrack);
      }
      setScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (videoSender) {
          screenSenderRef.current = videoSender;
          await videoSender.replaceTrack(screenTrack);
        }
        screenTrack.onended = () => {
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack && screenSenderRef.current) {
            screenSenderRef.current.replaceTrack(camTrack);
          }
          screenStreamRef.current = null;
          setScreenSharing(false);
        };
        setScreenSharing(true);
      } catch {
        // User cancelled or error
      }
    }
  }, [screenSharing]);

  const handleLeave = () => {
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    navigate(-1);
  };

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
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white/80 text-sm">
            {appointment ? `Консультация — ${appointment.date} ${appointment.time}` : "Загрузка..."}
          </span>
        </div>
        <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white/40 text-xs">
          {connected ? "Собеседник подключён" : "Ожидание подключения..."}
        </span>
      </div>

      {/* Videos */}
      <div className="flex-1 flex items-center justify-center gap-6 px-6 pb-4">
        <div className="relative flex-1 aspect-video bg-[#16213e] rounded-[20px] overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {!connected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="mx-auto mb-3 opacity-30">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-white/30 text-sm">Ожидание собеседника</p>
              </div>
            </div>
          )}
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded text-white text-xs [font-family:'Vela_Sans',sans-serif]">Собеседник</span>
        </div>
        {/* Local video */}
        <div className="relative flex-1 aspect-video bg-[#16213e] rounded-[20px] overflow-hidden">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 rounded text-white text-xs [font-family:'Vela_Sans',sans-serif]">Вы</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-6">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full border-0 flex items-center justify-center cursor-pointer transition-colors ${micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-500"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {micOn ? (
              <><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
            ) : (
              <><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.12 1.5-.35 2.18"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>
            )}
          </svg>
        </button>
        <button
          onClick={toggleCam}
          className={`w-12 h-12 rounded-full border-0 flex items-center justify-center cursor-pointer transition-colors ${camOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80 hover:bg-red-500"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {camOn ? (
              <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
            ) : (
              <><path d="M16.5 7.5L23 7v10l-6.5-.5"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><line x1="1" y1="1" x2="23" y2="23"/></>
            )}
          </svg>
        </button>
        <button
          onClick={toggleScreenShare}
          className={`w-12 h-12 rounded-full border-0 flex items-center justify-center cursor-pointer transition-colors ${screenSharing ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20"}`}
          title={screenSharing ? "Остановить демонстрацию" : "Демонстрация экрана"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </button>
        <button
          onClick={handleLeave}
          className="w-14 h-12 rounded-full bg-red-500 hover:bg-red-600 border-0 flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 004 .89 2 2 0 011.53 2v3a2 2 0 01-2.18 2A20 20 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 11.91"/>
            <line x1="23" y1="1" x2="1" y2="23"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoRoomPage;
