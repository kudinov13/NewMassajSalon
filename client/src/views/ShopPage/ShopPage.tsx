import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../../services/api";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  category: string;
  image: string | null;
};

const CATEGORIES = [
  { key: "all", label: "Все товары" },
  { key: "aromatherapy", label: "Ароматерапия" },
  { key: "spa", label: "SPA рецепты" },
  { key: "self-massage", label: "Курсы самомассажа" },
  { key: "nutrition", label: "Рецепты питания" },
];

const navItems = [
  "Диагностика",
  "Анализы",
  "Самомассаж",
  "Прямые трансляции",
  "Тибетские чаши",
  "Психология",
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
            <div className="relative w-full aspect-square p-3">
              {product.image ? (
                <img
                  src={`${BASE_URL}${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-[15px]"
                />
              ) : (
                <div className="w-full h-full bg-[#f5efe8] rounded-[15px] flex items-center justify-center">
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
  const [diagDropdown, setDiagDropdown] = useState(false);
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
            <div key={item} className="relative"
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
                className="px-4 py-1.5 rounded-full border border-[#00000033] [font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-sm cursor-pointer hover:bg-[#a6856d] hover:text-white hover:border-transparent transition-colors inline-block"
              >
                {item}
              </span>
              {item === "Диагностика" && diagDropdown && (
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
          {isAuthenticated && (
            <>
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Корзина"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#a6856d] text-white text-xs rounded-full flex items-center justify-center [font-family:'Vela_Sans',sans-serif]">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="Личный кабинет"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            </>
          )}
          {!isAuthenticated && (
            <Link
              to="/login"
              className="flex h-[34px] items-center justify-center px-6 bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors no-underline"
            >
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-white text-base">
                Вход
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* Hero banner */}
      <div className="px-10 pb-8">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-[48px] tracking-[-1.4px] leading-tight mb-6">
          Создайте идеальный баланс<br />тела и духа
        </h1>
        <div className="w-full h-[600px] rounded-[25px] overflow-hidden">
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
      <div className="px-10 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-4xl tracking-[-1px]">
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
          <div className="grid grid-cols-5 gap-5">
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
