import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

interface Lab {
  id: number;
  name: string;
  organization: string;
  url: string;
}

const navItems = [
  "Диагностика",
  "Анализы",
  "Самомассаж",
  "Прямые трансляции",
  "Тибетские чаши",
  "Психология",
];

const diagOptions = [
  { label: "Диагностика ногтей", slug: "nails" },
  { label: "Диагностика языка", slug: "tongue" },
  { label: "Диагностика глаз", slug: "eyes" },
  { label: "Диагностика кожи", slug: "skin" },
  { label: "Диагностика тела и осанки", slug: "body" },
];

const doctors = [
  { title: "Терапевт", desc: "Первичная диагностика, общее обследование" },
  { title: "Эндокринолог", desc: "Гормональные нарушения, обмен веществ" },
  { title: "Гастроэнтеролог", desc: "Заболевания ЖКТ, пищеварительной системы" },
  { title: "Невролог", desc: "Нервная система, головные боли, нарушения сна" },
];

const basicExams = [
  "Общий анализ крови",
  "Биохимический анализ крови",
  "Общий анализ мочи",
  "ЭКГ",
  "УЗИ брюшной полости",
];

const extendedExams = [
  "Гормональный профиль",
  "Анализ на витамины и микроэлементы",
  "Иммунологическое исследование",
  "Генетический скрининг",
];

const AnalysesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [diagDropdown, setDiagDropdown] = useState(false);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [formName, setFormName] = useState("");
  const [formOrg, setFormOrg] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    API.user.getCurrentUser()
      .then((user: any) => {
        setIsAuthenticated(true);
        if (user.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
    loadLabs();
  }, []);

  const loadLabs = async () => {
    try {
      const data = await API.labs.getAll();
      setLabs(data);
    } catch {}
  };

  const openCreateModal = () => {
    setEditingLab(null);
    setFormName("");
    setFormOrg("");
    setFormUrl("");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (lab: Lab) => {
    setEditingLab(lab);
    setFormName(lab.name);
    setFormOrg(lab.organization);
    setFormUrl(lab.url);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formOrg.trim() || !formUrl.trim()) {
      setFormError("Заполните все поля");
      return;
    }
    try {
      if (editingLab) {
        await API.labs.update(editingLab.id, { name: formName.trim(), organization: formOrg.trim(), url: formUrl.trim() });
      } else {
        await API.labs.create({ name: formName.trim(), organization: formOrg.trim(), url: formUrl.trim() });
      }
      setShowModal(false);
      loadLabs();
    } catch (e: any) {
      setFormError(e.message || "Ошибка");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить карточку?")) return;
    try {
      await API.labs.delete(id);
      loadLabs();
    } catch {}
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full">
      {/* Header */}
      <header className="w-full px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.svg" alt="Коосмо" className="h-8 w-auto" />
          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-xl">
            Harmony Spa
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item}
              className="relative"
              onMouseEnter={() => item === "Диагностика" && setDiagDropdown(true)}
              onMouseLeave={() => item === "Диагностика" && setDiagDropdown(false)}
            >
              <span
                onClick={() => {
                  if (item === "Тибетские чаши") navigate("/tibetan-bowls");
                  if (item === "Самомассаж") navigate("/shop?category=self-massage");
                  if (item === "Диагностика") navigate("/diagnostics/nails");
                  if (item === "Анализы") navigate("/analyses");
                  if (item === "Прямые трансляции") navigate("/streams");
                  if (item === "Психология") navigate("/psychology");
                }}
                className={`px-4 py-1.5 rounded-full border [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer transition-colors inline-block ${
                  item === "Анализы"
                    ? "bg-[#a6856d] text-white border-transparent"
                    : "border-[#00000033] text-[#000000b2] hover:bg-[#a6856d] hover:text-white hover:border-transparent"
                }`}
              >
                {item}
              </span>
              {item === "Диагностика" && diagDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-[15px] shadow-lg py-3 px-2 min-w-[200px] z-50">
                  {diagOptions.map((d) => (
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
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Корзина"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </Link>
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Профиль"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
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
      <section className="max-w-[900px] mx-auto text-center pt-16 pb-6 px-4">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-[48px] tracking-[-2px] leading-tight mb-4">
          Какие анализы можно сдать
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base max-w-[600px] mx-auto">
          Регулярные обследования помогают выявить проблемы со здоровьем на ранних стадиях. Ниже представлен список анализов, которые можно сдать для предварительной диагностики.
        </p>
      </section>

      {/* Labs section */}
      <section className="max-w-[1100px] mx-auto px-10 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl">
            Лаборатории для сдачи анализов
          </h2>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreateModal}
              className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
            >
              + Добавить
            </button>
          )}
        </div>

        {labs.length === 0 ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base">
            Лаборатории пока не добавлены.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labs.map((lab) => (
              <div key={lab.id} className="bg-white/70 rounded-[20px] p-6 border border-[#C9A882] flex flex-col">
                <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base mb-2">
                  {lab.name}
                </h3>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm mb-4 flex-1">
                  {lab.organization}
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={lab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors no-underline flex items-center"
                  >
                    Перейти на сайт
                  </a>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(lab)}
                        className="h-9 px-4 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(lab.id)}
                        className="h-9 px-4 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-red-50 transition-colors"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Doctors */}
      <section className="max-w-[1100px] mx-auto px-10 py-8">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6">
          К каким врачам можно обратиться
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div key={doc.title} className="bg-[#efdec5] rounded-[20px] p-6 border border-[#C9A882]">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-[#a6856d]/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">
                  {doc.title}
                </h3>
              </div>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-sm">
                {doc.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="max-w-[1100px] mx-auto px-10 py-8 pb-20">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6">
          Рекомендации по обследованию
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic */}
          <div className="bg-[#e3cbb1]/50 rounded-[20px] p-6">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">
              Базовое обследование
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {basicExams.map((item) => (
                <li key={item} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm flex items-start gap-2">
                  <span className="text-[#a6856d] mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Extended */}
          <div className="bg-[#e3cbb1]/50 rounded-[20px] p-6">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg mb-4">
              Расширенное обследование
            </h3>
            <ul className="list-none p-0 m-0 space-y-2">
              {extendedExams.map((item) => (
                <li key={item} className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm flex items-start gap-2">
                  <span className="text-[#a6856d] mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#f5e6d3] rounded-[25px] p-8 w-[420px] shadow-2xl">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-6">
              {editingLab ? "Редактировать" : "Добавить лабораторию"}
            </h3>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Название анализа"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
              />
              <input
                type="text"
                placeholder="Название организации"
                value={formOrg}
                onChange={(e) => setFormOrg(e.target.value)}
                className="h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
              />
              <input
                type="text"
                placeholder="Ссылка на сайт (https://...)"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
              />
            </div>
            {formError && (
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm mb-4">{formError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
              >
                {editingLab ? "Сохранить" : "Добавить"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 h-11 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysesPage;
