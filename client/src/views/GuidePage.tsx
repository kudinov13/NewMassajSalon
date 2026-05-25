import React, { useEffect, useState } from "react";
import { API } from "../services/api";
import Header from "../components/Header";

interface GuideItem {
  id: number;
  title: string;
  body: string;
  sortOrder: number;
}

const GuidePage: React.FC = () => {
  const [items, setItems] = useState<GuideItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<GuideItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    API.guide.getAll().then(setItems).catch(() => {});
    API.user.getCurrentUser()
      .then((u: any) => { if (u?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  const reload = () => API.guide.getAll().then(setItems).catch(() => {});

  const openCreate = () => {
    setEditItem(null);
    setFormTitle("");
    setFormBody("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (item: GuideItem) => {
    setEditItem(item);
    setFormTitle(item.title);
    setFormBody(item.body);
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formBody.trim()) {
      setFormError("Заполните все поля");
      return;
    }
    try {
      if (editItem) {
        await API.guide.update(editItem.id, { title: formTitle.trim(), body: formBody.trim() });
      } else {
        await API.guide.create({ title: formTitle.trim(), body: formBody.trim() });
      }
      setShowModal(false);
      reload();
    } catch (e: any) {
      setFormError(e.message || "Ошибка");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить этот пункт инструкции?")) return;
    await API.guide.delete(id);
    reload();
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="max-w-[900px] mx-auto text-center pt-16 pb-6 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e3cbb1]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5744" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </span>
          <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base">
            Навигация
          </span>
        </div>
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-4xl md:text-[48px] tracking-[-2px] leading-tight mb-4">
          Как пользоваться сайтом
        </h1>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base max-w-[550px] mx-auto">
          Пошаговая инструкция по всем функциям нашего сайта. Нажмите на любой пункт, чтобы раскрыть подробности.
        </p>
      </section>

      {/* Admin add button */}
      {isAdmin && (
        <div className="max-w-[800px] mx-auto px-4 pt-4 flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
          >
            + Добавить пункт
          </button>
        </div>
      )}

      {/* Guide items accordion */}
      <section className="max-w-[800px] mx-auto px-4 py-8 pb-20">
        {items.length === 0 ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-base text-center py-10">
            Инструкция пока не заполнена.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#f7ead8] rounded-[18px] border border-[#C9A882] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-transparent border-0 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#a6856d] text-white [font-family:'Vela_Sans',sans-serif] font-normal text-sm flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-base">
                      {item.title}
                    </span>
                  </div>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B5744"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`flex-shrink-0 transition-transform duration-200 ${openId === item.id ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openId === item.id && (
                  <div className="px-6 pb-5 pt-0">
                    <div className="ml-12">
                      <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm leading-[1.7] whitespace-pre-line">
                        {item.body}
                      </p>
                      {isAdmin && (
                        <div className="flex gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="h-8 px-4 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs cursor-pointer hover:bg-[#f5e6d3] transition-colors"
                          >
                            ✎ Редактировать
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 px-4 bg-transparent border border-[#C9A882] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs cursor-pointer hover:bg-red-50 transition-colors"
                          >
                            ✕ Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#f5e6d3] rounded-[25px] p-8 w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-6">
              {editItem ? "Редактировать пункт" : "Новый пункт инструкции"}
            </h3>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Заголовок *"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="h-11 px-4 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
              />
              <textarea
                placeholder="Текст инструкции *"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                rows={6}
                className="px-4 py-3 rounded-[12px] border border-[#C9A882] bg-white/70 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] resize-none"
              />
            </div>
            {formError && (
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm mb-4">{formError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
              >
                {editItem ? "Сохранить" : "Добавить"}
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

export default GuidePage;
