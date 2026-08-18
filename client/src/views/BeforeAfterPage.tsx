import React, { useEffect, useState, useRef } from "react";
import { API, BASE_URL } from "../services/api";
import Header from "../components/Header";

const CATEGORIES = ["Тело", "Ноги", "Спина", "Лицо"] as const;
type Category = typeof CATEGORIES[number];

interface BeforeAfterItem {
  id: number;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  category: string;
  createdAt: string;
}

const BeforeAfterPage: React.FC = () => {
  const [items, setItems] = useState<BeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BeforeAfterItem | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("Тело");
  const [modalCategory, setModalCategory] = useState<string>("Тело");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await API.beforeAfter.getAll();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    API.user.getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null));
    load();
  }, []);

  const isAdmin = user?.isAdmin;

  const openCreate = () => {
    setEditingItem(null);
    setModalTitle("");
    setModalDesc("");
    setModalCategory(activeCategory);
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview("");
    setAfterPreview("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: BeforeAfterItem) => {
    setEditingItem(item);
    setModalTitle(item.title);
    setModalDesc(item.description);
    setModalCategory(item.category || "Тело");
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(item.beforeImage ? `${BASE_URL}${item.beforeImage}` : "");
    setAfterPreview(item.afterImage ? `${BASE_URL}${item.afterImage}` : "");
    setError("");
    setShowModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "before") {
      setBeforeFile(file);
      setBeforePreview(url);
    } else {
      setAfterFile(file);
      setAfterPreview(url);
    }
  };

  const handleSave = async () => {
    setError("");
    if (!editingItem && (!beforeFile || !afterFile)) {
      setError("Загрузите оба изображения (до и после)");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", modalTitle);
      fd.append("description", modalDesc);
      fd.append("category", modalCategory);
      if (beforeFile) fd.append("beforeImage", beforeFile);
      if (afterFile) fd.append("afterImage", afterFile);
      if (editingItem) {
        await API.beforeAfter.update(editingItem.id, fd);
      } else {
        await API.beforeAfter.create(fd);
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      setError(e.message || "Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить результат?")) return;
    try {
      await API.beforeAfter.delete(id);
      await load();
    } catch (e: any) {
      alert(e.message || "Ошибка при удалении");
    }
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header activeItem="Результаты" />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 pb-16">
        <div className="mb-10">
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-3xl md:text-4xl tracking-[-1px] mb-4">
            Результаты до и после
          </h1>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed max-w-[800px]">
            Реальные результаты наших клиентов после прохождения процедур. Каждый случай уникален и показывает эффективность нашего подхода.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat
                ? "h-10 px-5 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border transition-colors cursor-pointer bg-[#a6856d] text-white border-[#a6856d]"
                : "h-10 px-5 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border transition-colors cursor-pointer bg-transparent text-[#6B5744] border-[#e3cbb1] hover:bg-[#f5e6d3]"
              }
            >
              {cat}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={openCreate}
              className="h-10 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border border-[#a6856d] cursor-pointer transition-colors ml-auto"
            >
              + Добавить результат
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60">
            Загрузка...
          </div>
        ) : items.filter(i => i.category === activeCategory).length === 0 ? (
          <div className="bg-[#f7ead8] rounded-[28px] p-8 text-center border border-[#C9A882]">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-base">
              Пока нет результатов в категории «{activeCategory}». {isAdmin ? "Добавьте первый результат!" : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {items.filter(i => i.category === activeCategory).map((item) => (
              <div
                key={item.id}
                className="bg-[#f7ead8] rounded-[28px] p-6 sm:p-8 border border-[#C9A882]"
              >
                {item.title && (
                  <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-3">
                    {item.title}
                  </h2>
                )}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4">
                  <div>
                    <div className="relative rounded-[20px] overflow-hidden aspect-[3/4] bg-[#e3cbb1]/30">
                      <img
                        src={`${BASE_URL}${item.beforeImage}`}
                        alt="До"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-black/50 text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs">
                        До
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="relative rounded-[20px] overflow-hidden aspect-[3/4] bg-[#e3cbb1]/30">
                      <img
                        src={`${BASE_URL}${item.afterImage}`}
                        alt="После"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-[#a6856d] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-xs">
                        После
                      </span>
                    </div>
                  </div>
                </div>
                {item.description && (
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/90 text-base leading-relaxed">
                    {item.description}
                  </p>
                )}
                {isAdmin && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEdit(item)}
                      className="h-9 px-5 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="h-9 px-5 border border-red-300 text-red-500 rounded-full bg-transparent [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-red-50 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#faf6f1] rounded-[25px] p-6 sm:p-8 w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-6">
              {editingItem ? "Редактировать результат" : "Новый результат"}
            </h3>
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mb-2">Категория</label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="h-11 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <input
                placeholder="Заголовок (необязательно)"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                className="h-11 px-4 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d]"
              />
              <textarea
                placeholder="Описание работы"
                value={modalDesc}
                onChange={(e) => setModalDesc(e.target.value)}
                rows={3}
                className="px-4 py-3 rounded-[12px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] resize-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mb-2">
                    Фото «До»
                  </label>
                  <label className="block cursor-pointer">
                    <div className="relative rounded-[16px] overflow-hidden aspect-[3/4] bg-[#e3cbb1]/30 border border-[#e3cbb1] hover:border-[#a6856d] transition-colors">
                      {beforePreview ? (
                        <img src={beforePreview} alt="До" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#6B5744]/40">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, "before")}
                    />
                  </label>
                </div>
                <div>
                  <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mb-2">
                    Фото «После»
                  </label>
                  <label className="block cursor-pointer">
                    <div className="relative rounded-[16px] overflow-hidden aspect-[3/4] bg-[#e3cbb1]/30 border border-[#e3cbb1] hover:border-[#a6856d] transition-colors">
                      {afterPreview ? (
                        <img src={afterPreview} alt="После" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#6B5744]/40">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, "after")}
                    />
                  </label>
                </div>
              </div>

              {error && (
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm">{error}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors disabled:opacity-60"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-11 bg-transparent border border-[#e3cbb1] text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm cursor-pointer hover:bg-[#f5e6d3] transition-colors"
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

export default BeforeAfterPage;
