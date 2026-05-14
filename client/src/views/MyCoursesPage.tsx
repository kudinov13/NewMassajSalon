import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../services/api";

type Course = {
  id: number;
  title: string;
  description: string;
  image: string | null;
};

const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => { if (!u) navigate("/login"); })
      .catch(() => navigate("/login"));
    API.courses.getMy()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      <header className="w-full px-4 sm:px-6 md:px-10 py-4 md:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Harmony Spa
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-[34px] items-center justify-center px-6 bg-transparent border border-[#00000033] rounded-[25px] hover:border-[#a6856d] transition-colors no-underline"
          >
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-base">
              Назад
            </span>
          </Link>
        </div>
      </header>

      <div className="px-4 sm:px-6 md:px-10 pb-16 max-w-[800px] mx-auto">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl sm:text-3xl md:text-4xl tracking-[-1px] mb-8">
          Мои курсы
        </h1>

        {loading ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-lg text-center py-16">
            Загрузка...
          </p>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-[25px] p-8 text-center">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-lg mb-4">
              У вас пока нет купленных курсов
            </p>
            <Link
              to="/shop?category=self-massage"
              className="inline-flex h-10 px-6 items-center bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-sm no-underline transition-colors"
            >
              Перейти в магазин
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-[20px] overflow-hidden flex flex-col sm:flex-row items-center gap-3 sm:gap-5 hover:shadow-lg transition-shadow"
              >
                {c.image ? (
                  <img
                    src={`${BASE_URL}${c.image}`}
                    alt={c.title}
                    className="w-[160px] h-[110px] object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-[160px] h-[110px] bg-[#f5efe8] flex items-center justify-center flex-shrink-0">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 py-4 pr-5">
                  <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-lg mb-1">
                    {c.title}
                  </h3>
                  {c.description && (
                    <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </div>
                <Link
                  to={`/courses/${c.id}`}
                  className="flex-shrink-0 mr-5 h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm flex items-center no-underline transition-colors"
                >
                  Смотреть
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
