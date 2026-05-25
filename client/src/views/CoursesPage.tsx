import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../services/api";

type Course = {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string | null;
};

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourseIds, setMyCourseIds] = useState<number[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    API.courses.getAll().then(setCourses).catch(() => {});
    API.user.getCurrentUser()
      .then((u) => {
        if (u) {
          setIsAuthenticated(true);
          if (u.isAdmin) setIsAdmin(true);
        }
      })
      .catch(() => {});
    API.courses.getMy()
      .then((list: Course[]) => setMyCourseIds(list.map(c => c.id)))
      .catch(() => {});
  }, []);

  const handlePurchase = async (courseId: number) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    try {
      await API.courses.purchase(courseId);
      setMyCourseIds(prev => [...prev, courseId]);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#efdec5] px-4 sm:px-6 md:px-10 py-6 sm:py-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[#6B5744] no-underline [font-family:'Vela_Sans',sans-serif] font-light text-sm hover:text-[#a6856d]">
            ← На главную
          </Link>
          {isAdmin && (
            <Link to="/admin" className="h-9 px-4 bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm flex items-center no-underline hover:bg-[#8d6e58]">
              Управление курсами
            </Link>
          )}
        </div>

        <section className="text-center mb-10 sm:mb-12">
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl sm:text-[42px] tracking-[-1.5px] mb-3">
            Видео-курсы
          </h1>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-base max-w-[600px] mx-auto">
            Изучайте материалы в удобном темпе. Каждый курс включает набор видео-уроков.
          </p>
        </section>

        {courses.length === 0 ? (
          <div className="text-center py-20">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-base">Курсы пока не добавлены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const owned = myCourseIds.includes(course.id);
              return (
                <div key={course.id} className="bg-white/80 rounded-[22px] overflow-hidden border border-[#e3cbb1]/40 flex flex-col">
                  <div className="h-[180px] bg-[#f5efe8] flex items-center justify-center">
                    {course.image ? (
                      <img src={`${BASE_URL}${course.image}`} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-2">{course.title}</h3>
                    <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm leading-relaxed mb-4 flex-1">
                      {course.description || "Без описания"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg">
                        {course.price > 0 ? `${course.price} ₽` : "Бесплатно"}
                      </span>
                      {owned || isAdmin ? (
                        <Link
                          to={`/courses/${course.id}`}
                          className="h-9 px-5 bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm flex items-center no-underline hover:bg-[#8d6e58]"
                        >
                          Смотреть
                        </Link>
                      ) : (
                        <button
                          onClick={() => handlePurchase(course.id)}
                          className="h-9 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
                        >
                          {course.price > 0 ? "Купить" : "Получить"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
