import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../../services/api";
import Header from "../../components/Header";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  category: string;
  image: string | null;
  courseId?: number | null;
};

type CourseVideo = {
  id: number;
  courseId: number;
  title: string;
  videoUrl: string;
  sortOrder: number;
};

const CATEGORIES = [
  { key: "all", label: "Все товары" },
  { key: "aromatherapy", label: "Ароматерапия" },
  { key: "spa", label: "SPA рецепты" },
  { key: "self-massage", label: "Курсы самомассажа" },
  { key: "nutrition", label: "Рецепты питания" },
];


const ProductCard = ({
  product,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCart,
  isAuthenticated,
}: {
  product: Product;
  isAdmin: boolean;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  onAddToCart: (id: number) => void;
  isAuthenticated: boolean;
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="relative group" style={{ perspective: "800px" }}>
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div style={{ backfaceVisibility: "hidden" }}>
          <div className="bg-white rounded-[20px] overflow-hidden">
            <div className="relative w-full aspect-square">
              {product.image ? (
                <img
                  src={`${BASE_URL}${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-t-[20px]"
                />
              ) : (
                <div className="w-full h-full bg-[#f5efe8] rounded-t-[20px] flex items-center justify-center">
                  <span className="text-[#00000033] text-4xl">📦</span>
                </div>
              )}
              {/* Top-right buttons row */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Description button */}
                {product.description && (
                  <button
                    type="button"
                    onClick={() => setFlipped(true)}
                    className="h-10 px-3 flex items-center gap-1.5 bg-white/90 rounded-full border-0 cursor-pointer text-[#00000099] hover:text-[#a6856d] hover:bg-white transition-colors shadow-sm"
                    aria-label="Описание"
                    title="Описание"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-light text-xs">Описание</span>
                  </button>
                )}
                {/* Add to cart button */}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(product.id)}
                    className="w-10 h-10 flex items-center justify-center bg-white/90 rounded-full border-0 cursor-pointer text-[#00000099] hover:text-[#a6856d] hover:bg-white transition-colors shadow-sm"
                    aria-label="В корзину"
                    title="В корзину"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </button>
                )}
                {/* Heart */}
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center bg-white/90 rounded-full border-0 cursor-pointer text-[#00000099] hover:text-[#a6856d] hover:bg-white transition-colors shadow-sm"
                  aria-label="В избранное"
                >
                  <svg width="22" height="20" viewBox="0 0 20 18" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M10 17S1 11.5 1 6a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 5.5-9 11-9 11Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Info */}
          <div className="mt-2 flex justify-between items-start px-1">
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-sm leading-tight max-w-[70%]">
              {product.name}
            </span>
            <div className="text-right">
              {product.oldPrice ? (
                <>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000066] text-xs line-through block">
                    {product.oldPrice} ₽
                  </span>
                  <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-sm">
                    {product.price} ₽
                  </span>
                </>
              ) : (
                <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-sm">
                  {product.price} ₽
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Back (description) */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="bg-white rounded-[20px] overflow-hidden h-full flex flex-col">
            <div className="flex-1 p-5 overflow-auto">
              <h4 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-base mb-2">
                {product.name}
              </h4>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-sm leading-relaxed whitespace-pre-line">
                {product.description || "Описание отсутствует"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="m-4 mt-0 h-9 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-sm border-0 cursor-pointer transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity z-10">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="w-7 h-7 rounded-full bg-white/90 border-0 cursor-pointer flex items-center justify-center text-sm hover:bg-[#a6856d] hover:text-white transition-colors"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="w-7 h-7 rounded-full bg-white/90 border-0 cursor-pointer flex items-center justify-center text-sm hover:bg-red-500 hover:text-white transition-colors"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formOldPrice, setFormOldPrice] = useState("");
  const [formCategory, setFormCategory] = useState("aromatherapy");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video management for courses
  const [courseVideos, setCourseVideos] = useState<CourseVideo[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [editingVideoTitle, setEditingVideoTitle] = useState("");

  useEffect(() => {
    API.user.getCurrentUser()
      .then((user) => {
        if (user) {
          setIsAuthenticated(true);
          if (user.isAdmin) setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      API.cart.get()
        .then((items: any[]) => setCartCount(items.reduce((s: number, i: any) => s + i.quantity, 0)))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  const loadProducts = async () => {
    try {
      const data = await API.products.getAll(activeCategory);
      setProducts(data);
    } catch { setProducts([]); }
  };

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key);
    if (key === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: key });
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      const items = await API.cart.add(productId);
      setCartCount(items.reduce((s: number, i: any) => s + i.quantity, 0));
    } catch {
      navigate("/login");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
    setFormOldPrice("");
    setFormCategory("aromatherapy");
    setFormImage(null);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description || "");
    setFormPrice(String(p.price));
    setFormOldPrice(p.oldPrice ? String(p.oldPrice) : "");
    setFormCategory(p.category);
    setFormImage(null);
    setFormError("");
    setShowModal(true);
    // Load videos if it's a course product
    if (p.category === 'self-massage' && p.id) {
      API.products.getVideos(p.id).then(setCourseVideos).catch(() => setCourseVideos([]));
    } else {
      setCourseVideos([]);
    }
  };

  const handleUploadVideo = async () => {
    if (!videoFile || !editingProduct) return;
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('video', videoFile);
      fd.append('title', videoTitle || 'Урок');
      const newVideo = await API.products.uploadVideo(editingProduct.id, fd);
      setCourseVideos(prev => [...prev, newVideo]);
      setVideoFile(null);
      setVideoTitle('');
    } catch {} finally { setUploadingVideo(false); }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!editingProduct || !window.confirm('Удалить видео?')) return;
    await API.products.deleteVideo(editingProduct.id, videoId);
    setCourseVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const handleMoveVideo = async (index: number, direction: -1 | 1) => {
    if (!editingProduct) return;
    const newList = [...courseVideos];
    const swapIdx = index + direction;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    [newList[index], newList[swapIdx]] = [newList[swapIdx], newList[index]];
    setCourseVideos(newList);
    const videoIds = newList.map(v => v.id);
    await API.products.reorderVideos(editingProduct.id, videoIds);
  };

  const handleSaveVideoTitle = async (videoId: number) => {
    if (!editingProduct || !editingVideoTitle.trim()) return;
    await API.products.updateVideoTitle(editingProduct.id, videoId, editingVideoTitle.trim());
    setCourseVideos(prev => prev.map(v => v.id === videoId ? { ...v, title: editingVideoTitle.trim() } : v));
    setEditingVideoId(null);
    setEditingVideoTitle('');
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPrice.trim()) {
      setFormError("Заполните название и цену");
      return;
    }
    setSubmitting(true);
    setFormError("");
    const fd = new FormData();
    fd.append("name", formName.trim());
    fd.append("description", formDescription.trim());
    fd.append("price", formPrice);
    if (formOldPrice) fd.append("oldPrice", formOldPrice);
    fd.append("category", formCategory);
    if (formImage) {
      fd.append("image", formImage);
    } else if (editingProduct?.image) {
      fd.append("existingImage", editingProduct.image);
    }
    try {
      if (editingProduct) {
        await API.products.update(editingProduct.id, fd);
      } else {
        await API.products.create(fd);
      }
      setShowModal(false);
      loadProducts();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить товар?")) return;
    try {
      await API.products.delete(id);
      loadProducts();
    } catch {}
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header cartCount={cartCount} />

      {/* Hero banner */}
      <div className="px-4 sm:px-6 md:px-10 pb-8">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-2xl sm:text-4xl md:text-[48px] tracking-[-1.4px] leading-tight mb-6">
          Создайте идеальный баланс<br />тела и духа
        </h1>
        <div className="w-full h-[200px] sm:h-[400px] md:h-[600px] rounded-[20px] sm:rounded-[25px] overflow-hidden">
          <img
            src="/shop-banner.png"
            alt="Баннер магазина"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.background = '#c4a882';
              (e.target as HTMLImageElement).style.display = 'block';
            }}
          />
        </div>
      </div>

      {/* Catalog */}
      <div className="px-4 sm:px-6 md:px-10 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl sm:text-3xl md:text-4xl tracking-[-1px]">
            Каталог
          </h2>
          {isAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="h-10 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-sm transition-colors cursor-pointer border-0"
            >
              + Добавить товар
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-5 py-2 rounded-full border [font-family:'Vela_Sans',sans-serif] text-sm cursor-pointer transition-colors ${
                activeCategory === cat.key
                  ? "bg-[#a6856d] text-white border-[#a6856d]"
                  : "bg-transparent text-[#000000b2] border-[#00000033] hover:border-[#a6856d]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-lg text-center py-16">
            Товаров пока нет
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin={isAdmin}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onAddToCart={handleAddToCart}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#efdec5] w-full max-w-[480px] rounded-[25px] p-8 border-2 border-[#e3cbb1] shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl mb-6">
              {editingProduct ? "Редактировать товар" : "Добавить товар"}
            </h3>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">Название</span>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-10 px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela_Sans',sans-serif] text-sm focus:outline-none focus:border-[#a6856d]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">Описание</span>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Описание товара (необязательно)"
                  className="px-4 py-2 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela_Sans',sans-serif] text-sm focus:outline-none focus:border-[#a6856d] resize-y"
                />
              </label>
              <div className="flex gap-3">
                <label className="flex flex-col gap-1 flex-1">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">Цена (₽)</span>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="h-10 px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela_Sans',sans-serif] text-sm focus:outline-none focus:border-[#a6856d]"
                  />
                </label>
                <label className="flex flex-col gap-1 flex-1">
                  <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">Старая цена (скидка)</span>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(e.target.value)}
                    placeholder="Не обязательно"
                    className="h-10 px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela_Sans',sans-serif] text-sm focus:outline-none focus:border-[#a6856d]"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">Категория</span>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="h-10 px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela_Sans',sans-serif] text-sm focus:outline-none focus:border-[#a6856d]"
                >
                  {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-sm">Фото товара</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormImage(e.target.files?.[0] || null)}
                  className="[font-family:'Vela_Sans',sans-serif] text-sm"
                />
                {editingProduct?.image && !formImage && (
                  <span className="text-xs text-[#00000066]">Текущее фото сохранится, если не выбрать новое</span>
                )}
              </label>

              {/* Video management for course products */}
              {formCategory === 'self-massage' && editingProduct && (
                <div className="border-2 border-[#e3cbb1] rounded-[15px] p-4">
                  <h4 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-base mb-3">Видеоуроки</h4>
                  
                  {/* Video list */}
                  {courseVideos.length > 0 && (
                    <div className="flex flex-col gap-2 mb-4 max-h-[200px] overflow-y-auto">
                      {courseVideos.map((v, i) => (
                        <div key={v.id} className="flex items-center gap-2 bg-[#f5efe8] rounded-[10px] px-3 py-2">
                          <span className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xs w-5">{i + 1}.</span>
                          {editingVideoId === v.id ? (
                            <input
                              value={editingVideoTitle}
                              onChange={e => setEditingVideoTitle(e.target.value)}
                              onBlur={() => handleSaveVideoTitle(v.id)}
                              onKeyDown={e => e.key === 'Enter' && handleSaveVideoTitle(v.id)}
                              className="flex-1 h-7 px-2 rounded border border-[#e3cbb1] [font-family:'Vela_Sans',sans-serif] text-xs outline-none"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="flex-1 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-xs cursor-pointer hover:text-[#a6856d]"
                              onClick={() => { setEditingVideoId(v.id); setEditingVideoTitle(v.title); }}
                              title="Нажмите чтобы переименовать"
                            >
                              {v.title}
                            </span>
                          )}
                          <button type="button" onClick={() => handleMoveVideo(i, -1)} disabled={i === 0} className="w-6 h-6 rounded bg-white border border-[#e3cbb1] text-[#6B5744] text-xs cursor-pointer disabled:opacity-30 flex items-center justify-center">↑</button>
                          <button type="button" onClick={() => handleMoveVideo(i, 1)} disabled={i === courseVideos.length - 1} className="w-6 h-6 rounded bg-white border border-[#e3cbb1] text-[#6B5744] text-xs cursor-pointer disabled:opacity-30 flex items-center justify-center">↓</button>
                          <button type="button" onClick={() => handleDeleteVideo(v.id)} className="w-6 h-6 rounded bg-white border border-red-300 text-red-500 text-xs cursor-pointer hover:bg-red-50 flex items-center justify-center">×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload new video */}
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={e => setVideoTitle(e.target.value)}
                      placeholder="Название урока"
                      className="h-9 px-3 bg-white border border-[#e3cbb1] rounded-[10px] [font-family:'Vela_Sans',sans-serif] text-sm outline-none focus:border-[#a6856d]"
                    />
                    <input
                      type="file"
                      accept="video/*"
                      onChange={e => setVideoFile(e.target.files?.[0] || null)}
                      className="[font-family:'Vela_Sans',sans-serif] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleUploadVideo}
                      disabled={!videoFile || uploadingVideo}
                      className="h-8 px-4 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-xs border-0 cursor-pointer transition-colors disabled:opacity-40"
                    >
                      {uploadingVideo ? 'Загрузка...' : 'Загрузить видео'}
                    </button>
                  </div>
                </div>
              )}

              {formCategory === 'self-massage' && !editingProduct && (
                <div className="bg-[#f5efe8] rounded-[15px] px-4 py-3">
                  <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-xs">
                    Сохраните товар, затем откройте его для редактирования, чтобы добавить видеоуроки.
                  </p>
                </div>
              )}

              {formError && (
                <div className="[font-family:'Vela_Sans',sans-serif] text-red-700 text-sm bg-red-50 border border-red-200 rounded-[15px] px-4 py-2">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex-1 h-11 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] text-base border-0 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {submitting ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 bg-transparent border-2 border-[#a6856d] text-[#000000b2] rounded-full [font-family:'Vela_Sans',sans-serif] text-base cursor-pointer hover:bg-[#a6856d] hover:text-white transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
