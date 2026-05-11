import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../services/api";

const navItems = [
  { label: "Диагностика", path: "/diagnostics/nails" },
  { label: "Анализы", path: "/analyses" },
  { label: "Самомассаж", path: "/shop?category=self-massage" },
  { label: "Прямые трансляции", path: "/streams" },
  { label: "Тибетские чаши", path: "/tibetan-bowls" },
  { label: "Психология", path: "/psychology" },
];

const TibetanBowlsPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [diagDropdown, setDiagDropdown] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    API.user.getCurrentUser()
      .then((user) => {
        if (user) {
          setIsAuthenticated(true);
          if (user.isAdmin || user.isBowlsSpecialist) setCanEdit(true);
        }
      })
      .catch(() => {});
    API.bowls.getAudio().then(d => { if (d.url) setAudioUrl(d.url); }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await API.auth.logout();
      setIsAuthenticated(false);
    } catch {}
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <header className="w-full px-10 py-6 flex items-center justify-between relative z-20">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Harmony Spa
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.label === "Диагностика" && setDiagDropdown(true)}
              onMouseLeave={() => item.label === "Диагностика" && setDiagDropdown(false)}
            >
              <span
                onClick={() => { if (item.path) navigate(item.path); }}
                className={`px-4 py-1.5 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors inline-block ${
                  item.label === "Тибетские чаши"
                    ? "bg-[#a6856d] text-white border-[#a6856d]"
                    : "border-[#00000033] text-[#000000b2] hover:bg-[#a6856d] hover:text-white hover:border-transparent"
                }`}
              >
                {item.label}
              </span>
              {item.label === "Диагностика" && diagDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-[15px] shadow-lg py-3 px-2 min-w-[200px] z-50">
                  {[
                    { label: "Диагностика ногтей", slug: "nails" },
                    { label: "Диагностика языка", slug: "tongue" },
                    { label: "Диагностика глаз", slug: "eyes" },
                    { label: "Диагностика кожи", slug: "skin" },
                    { label: "Диагностика тела и осанки", slug: "body" },
                  ].map((d) => (
                    <button
                      key={d.slug}
                      onClick={() => { navigate(`/diagnostics/${d.slug}`); setDiagDropdown(false); }}
                      className="block w-full text-left px-4 py-2 rounded-[10px] bg-transparent text-[#6B5744] hover:bg-[#f5e6d3] border-0 cursor-pointer [font-family:'Vela_Sans',sans-serif] font-light text-sm transition-colors"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline" title="Корзина">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </Link>
              <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline" title="Личный кабинет">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            </>
          ) : (
            <Link to="/login" className="flex h-[34px] items-center justify-center px-6 bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors no-underline">
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white text-base">Вход</span>
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full h-[520px] overflow-hidden rounded-b-[40px]">
        <img
          src="/bowls-hero.png"
          alt="Тибетские чаши"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Title block */}
      <section className="max-w-[900px] mx-auto text-center pt-10 pb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-1">
          <img src="/stars_1.svg" alt="" className="w-8 h-8" />
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[64px] tracking-[-2px] leading-tight">
            Услышь себя
          </h1>
        </div>
        <div className="flex justify-center">
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base ml-60">В прямом смысле</span>
        </div>
        <div className="flex items-center justify-center gap-8 mt-8 mb-4">
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-lg">
            • Глубокое расслабление
          </span>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-lg">
            • Очищение ума
          </span>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-lg">
            • Контакт со своим Высшим «Я»
          </span>
        </div>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base mt-4">
          Ты уходишь не просто отдохнувшим — Ты уходишь другим.
        </p>
      </section>

      {/* Что это такое */}
      <section className="max-w-[1100px] mx-auto px-10 py-12">
        <div className="flex items-start gap-12">
          <div className="w-[420px] flex-shrink-0">
            <img
              src="/bowls-about.png"
              alt="Тибетские чаши в природе"
              className="w-full h-[320px] object-cover rounded-[25px]"
            />
          </div>
          <div className="flex-1 pt-2">
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl tracking-[-0.8px] mb-5">
              Что это такое?
            </h2>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-[15px] leading-[1.7]">
              Мы соединили ручной массаж, виброакустику и древнюю
              звуковую практику в один сеанс. Каждая чаша настроена на
              определённую частоту, которая резонирует с вашим телом
              и сознанием.
            </p>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-[15px] leading-[1.7] mt-4">
              Во время сеанса вы не просто слушаете звук — вы
              становитесь частью вибрации. Звуковые волны проникают в
              каждую клетку, восстанавливая естественные ритмы
              вашего организма.
            </p>
          </div>
        </div>
      </section>

      {/* Что вы получите */}
      <section className="max-w-[1100px] mx-auto px-10 py-12">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl tracking-[-0.8px] text-center mb-3">
          Что вы получите
        </h2>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm text-center mb-10">
          Каждый сеанс — это уникальное путешествие в глубины вашего сознания
        </p>

        <div className="grid grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#efdec5] rounded-[25px] p-7 text-center border-2 border-[#C9A882]">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-[#C9A882] flex items-center justify-center">
              <img src="/heart.svg" alt="" className="w-7 h-7" />
            </div>
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-3">
              Глубокая вибрация
            </h3>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed">
              Звук проникает туда, куда не достают руки
              массажиста — в глубокие слои мышц,
              фасций, высвобождая накопленное
              напряжение.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-[#efdec5] rounded-[25px] p-7 text-center border-2 border-[#C9A882]">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-[#C9A882] flex items-center justify-center">
              <img src="/brain.svg" alt="" className="w-7 h-7" />
            </div>
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-3">
              Эмоциональное освобождение
            </h3>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed">
              Вибрации чаш помогают освободить
              эмоциональные блоки, хранящиеся в
              теле годами, принося чувство легкости и
              свободы.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-[#efdec5] rounded-[25px] p-7 text-center border-2 border-[#C9A882]">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-[#C9A882] flex items-center justify-center">
              <img src="/medicine-heart-hear.svg" alt="" className="w-7 h-7" />
            </div>
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-3">
              Духовное пробуждение
            </h3>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed">
              Особые частоты способствуют
              медитативному состоянию и помогают
              установить контакт с вашим истинным
              «Я».
            </p>
          </div>
        </div>
      </section>

      {/* Как проходит сеанс */}
      <section className="max-w-[1100px] mx-auto px-10 py-12">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl tracking-[-0.8px] mb-10">
          Как проходит сеанс
        </h2>

        <div className="flex items-start gap-12">
          <div className="flex-1">
            {[
              { num: "1", title: "Подготовка", text: "Вы располагаетесь в комфортном положении на специальном массажном столе.", numBottom: "-4px", numRight: "14px" },
              { num: "2", title: "Настройка", text: "Мастер подбирает чаши специально для вас, основываясь на вашем состоянии.", numBottom: "-5px" },
              { num: "3", title: "Погружение", text: "Начинается звуковое путешествие — вибрации окутывают всё ваше тело.", numBottom: "-8px" },
              { num: "4", title: "Интеграция", text: "После сеанса даём телу и сознанию время интегрировать полученный опыт.", numBottom: "-4px" },
            ].map((step, i) => (
              <div key={step.num} className={`flex items-start gap-6 ${i < 3 ? "mb-10" : ""}`}>
                <div className="relative flex-shrink-0 w-12 h-12">
                  <div className="absolute top-0 left-0 w-11 h-11 rounded-full border border-[#C9A882]" />
                  <span className="absolute [font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[36px] leading-none" style={{ bottom: step.numBottom, right: step.numRight || "10px" }}>
                    {step.num}
                  </span>
                </div>
                <div className="pt-1">
                  <h4 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-1">
                    {step.title}
                  </h4>
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-[440px] flex-shrink-0">
            <img
              src="/bowls-session.png"
              alt="Сеанс тибетских чаш"
              className="w-full h-[380px] object-cover rounded-[25px]"
            />
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="w-full bg-[#8d6e58] py-14 mt-8">
        <div className="max-w-[800px] mx-auto text-center px-4">
          <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-[#a6856d] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-white text-xl leading-relaxed mb-6">
            "Это был самый глубокий опыт расслабления в моей жизни. Я
            чувствовала, как каждая клетка моего тела резонирует со звуком.
            После сеанса я была в состоянии полной гармонии."
          </p>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#ffffffb2] text-sm">
            –Анна, 32 года
          </span>
        </div>
      </section>

      {/* Audio Player */}
      {audioUrl && (
        <section className="max-w-[700px] mx-auto px-4 py-10">
          <div className="bg-[#f7ead8] rounded-[25px] p-8 border border-[#C9A882]">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-2 text-center">
              Послушайте звучание тибетских чаш
            </h3>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm text-center mb-6">
              Закройте глаза и позвольте вибрациям наполнить ваше сознание
            </p>
            <div className="flex items-center gap-4 justify-center">
              <button
                type="button"
                onClick={() => {
                  if (!audioRef.current) {
                    audioRef.current = new Audio(`${BASE_URL}${audioUrl}`);
                    audioRef.current.onended = () => setIsPlaying(false);
                  }
                  if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
                  else { audioRef.current.play(); setIsPlaying(true); }
                }}
                className="w-14 h-14 rounded-full bg-[#a6856d] hover:bg-[#8d6e58] border-0 flex items-center justify-center cursor-pointer transition-colors"
              >
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
                {isPlaying ? "Воспроизведение..." : "Нажмите для воспроизведения"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Upload audio (admin / bowls specialist) */}
      {canEdit && (
        <section className="max-w-[700px] mx-auto px-4 pb-6">
          <div className="bg-white/60 rounded-[20px] p-5 border border-[#e3cbb1]/40 flex items-center gap-4">
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm">
              {audioUrl ? "Заменить аудиозапись:" : "Загрузить аудиозапись чаш:"}
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const res = await API.bowls.uploadAudio(file);
                  setAudioUrl(res.url);
                } catch {}
              }}
              className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm"
            />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-[700px] mx-auto text-center py-16 px-4">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[40px] tracking-[-1px] leading-tight mb-4">
          Готовы к трансформации?
        </h2>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base mb-8">
          Запишитесь на сеанс и откройте для себя новое измерение<br />
          расслабления и самопознания.
        </p>
        <Link
          to="/tibetan-bowls/booking"
          className="inline-flex h-12 px-10 items-center bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-base no-underline transition-colors mb-4"
        >
          Записаться на сеанс
        </Link>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mt-4">
          Длительность: 60 минут · Стоимость: 5000 ₽
        </p>
      </section>
    </div>
  );
};

export default TibetanBowlsPage;
