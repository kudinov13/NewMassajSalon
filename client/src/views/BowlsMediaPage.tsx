import React, { useEffect, useState } from "react";
import { API, BASE_URL } from "../services/api";
import Header from "../components/Header";

interface MediaItem {
  id: number;
  type: "audio" | "video";
  title: string;
  url: string;
}

const BowlsMediaPage: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    API.bowlsMedia.getAll().then(setItems).catch(() => {});
    API.user.getCurrentUser()
      .then((u: any) => {
        if (u?.isAdmin || u?.isBowlsSpecialist) setCanEdit(true);
      })
      .catch(() => {});
  }, []);

  const reload = () => API.bowlsMedia.getAll().then(setItems).catch(() => {});

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      await API.bowlsMedia.upload(uploadFile, uploadTitle.trim());
      setUploadFile(null);
      setUploadTitle("");
      reload();
    } catch {}
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить эту запись?")) return;
    await API.bowlsMedia.delete(id);
    reload();
  };

  const videos = items.filter((i) => i.type === "video");
  const audios = items.filter((i) => i.type === "audio");

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header activeItem="Тибетские чаши" />

      {/* Hero */}
      <section className="max-w-[900px] mx-auto text-center pt-16 pb-6 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e3cbb1]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base">
            Тибетские чаши
          </span>
        </div>
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-4xl md:text-[48px] tracking-[-2px] leading-tight mb-4">
          Записи и обзоры
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base max-w-[550px] mx-auto">
          Посмотрите, как проходит сеанс, и послушайте звучание тибетских чаш.
        </p>
      </section>

      {/* Upload form (admin / bowls specialist) */}
      {canEdit && (
        <section className="max-w-[800px] mx-auto px-4 pt-4 pb-2">
          <div className="bg-white/60 rounded-[20px] p-5 border border-[#e3cbb1]/40">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-3">
              Добавить видео или аудио
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <input
                type="text"
                placeholder="Название записи"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="h-10 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] flex-1 w-full sm:w-auto"
              />
              <input
                type="file"
                accept="video/*,audio/*,.mp3,.wav,.ogg,.aac,.flac"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="[font-family:'Vela_Sans',sans-serif] text-xs"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className={`h-10 px-6 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors ${
                  !uploadFile || uploading
                    ? "bg-[#a6856d]/40 text-white/60 cursor-not-allowed"
                    : "bg-[#a6856d] hover:bg-[#8d6e58] text-white"
                }`}
              >
                {uploading ? "Загрузка..." : "Загрузить"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="max-w-[800px] mx-auto px-4 py-8">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl tracking-[-0.5px] mb-6">
            Видеообзоры
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {videos.map((v) => (
              <div
                key={v.id}
                className="bg-[#f7ead8] rounded-[18px] border border-[#C9A882] overflow-hidden"
              >
                <div
                  className="relative w-full aspect-video bg-black/10 cursor-pointer group"
                  onClick={() => setPlayingVideo(v.url)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#a6856d]/80 group-hover:bg-[#a6856d] flex items-center justify-center transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
                    {v.title || "Видеозапись"}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="h-7 px-3 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Audio */}
      {audios.length > 0 && (
        <section className="max-w-[800px] mx-auto px-4 py-8 pb-20">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl tracking-[-0.5px] mb-6">
            Аудиозаписи
          </h2>
          <div className="flex flex-col gap-4">
            {audios.map((a) => (
              <div
                key={a.id}
                className="bg-[#f7ead8] rounded-[18px] border border-[#C9A882] p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#a6856d]/10">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                      </svg>
                    </span>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">
                      {a.title || "Аудиозапись"}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="h-7 px-3 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <audio
                  controls
                  src={a.url.startsWith("http") ? a.url : `${BASE_URL}${a.url}`}
                  className="w-full"
                  preload="metadata"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <section className="max-w-[800px] mx-auto px-4 py-10">
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base text-center">
            Записи пока не добавлены.
          </p>
        </section>
      )}

      {/* Video playback modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPlayingVideo(null)} />
          <div className="relative bg-black rounded-xl overflow-hidden w-[90vw] max-w-[900px] aspect-video shadow-2xl">
            <video
              src={playingVideo.startsWith("http") ? playingVideo : `${BASE_URL}${playingVideo}`}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setPlayingVideo(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 text-[#6B5744] border-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BowlsMediaPage;
