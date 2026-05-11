import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API, BASE_URL } from "../services/api";

type Video = { id: number; title: string; videoUrl: string; sortOrder: number };
type Course = { id: number; title: string; description: string; videos: Video[] };

const CourseViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    API.courses.get(parseInt(id))
      .then((c) => {
        setCourse(c);
        if (c.videos?.length) setActiveVideo(c.videos[0]);
      })
      .catch((e) => setError(e.message || "Нет доступа"));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#efdec5] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-lg mb-4">{error}</p>
          <Link to="/courses" className="text-[#a6856d] [font-family:'Vela_Sans',sans-serif] font-light text-sm">← К курсам</Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#efdec5] flex items-center justify-center">
        <span className="[font-family:'Vela_Sans',sans-serif] text-[#6B5744]/50">Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#efdec5] px-6 py-8">
      <div className="max-w-[1200px] mx-auto">
        <Link to="/courses" className="inline-flex items-center gap-2 text-[#6B5744] no-underline [font-family:'Vela_Sans',sans-serif] font-light text-sm mb-6 hover:text-[#a6856d]">
          ← Все курсы
        </Link>

        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6">{course.title}</h1>

        <div className="flex gap-6">
          {/* Video Player */}
          <div className="flex-1">
            {activeVideo ? (
              <div className="bg-black rounded-[20px] overflow-hidden aspect-video">
                <video
                  key={activeVideo.id}
                  src={`${BASE_URL}${activeVideo.videoUrl}`}
                  controls
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="bg-[#f5efe8] rounded-[20px] aspect-video flex items-center justify-center">
                <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50">Нет видео</span>
              </div>
            )}
            {activeVideo && (
              <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mt-4">{activeVideo.title}</h2>
            )}
          </div>

          {/* Video List */}
          <div className="w-[300px] flex-shrink-0">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-3">
              Уроки ({course.videos.length})
            </h3>
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
              {course.videos.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveVideo(v)}
                  className={`text-left px-4 py-3 rounded-[12px] border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors ${
                    activeVideo?.id === v.id
                      ? "bg-[#a6856d] text-white border-[#a6856d]"
                      : "bg-white/70 text-[#6B5744] border-[#e3cbb1]/40 hover:border-[#a6856d]"
                  }`}
                >
                  <span className="font-normal">{i + 1}.</span> {v.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewPage;
