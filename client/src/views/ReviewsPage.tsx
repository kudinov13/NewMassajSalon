import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../services/api";
import Header from "../components/Header";

interface Review {
  id: number;
  userId: number | null;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 18 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? "#a6856d" : "none"}
          stroke="#a6856d"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasReview, setHasReview] = useState(false);

  const loadReviews = async () => {
    try {
      const data = await API.reviews.getAll();
      setReviews(data);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    API.user.getCurrentUser()
      .then((u) => {
        setUser(u);
        if (u && reviews.some((r) => r.userId === u.id)) {
          setHasReview(true);
        }
      })
      .catch(() => setUser(null));
    loadReviews().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user && reviews.some((r) => r.userId === user.id)) {
      setHasReview(true);
    }
  }, [reviews, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Для оставления отзыва необходимо авторизоваться");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Выберите оценку от 1 до 5 звёзд");
      return;
    }

    if (text.trim().length < 5) {
      setError("Отзыв должен содержать минимум 5 символов");
      return;
    }

    setSubmitting(true);
    try {
      await API.reviews.create({ rating, text: text.trim() });
      setSuccess("Спасибо! Ваш отзыв опубликован.");
      setText("");
      setRating(0);
      await loadReviews();
      setHasReview(true);
    } catch (e: any) {
      setError(e.message || "Ошибка при отправке отзыва");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header activeItem="Отзывы" />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 pb-16">
        <div className="mb-10">
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-3xl md:text-4xl tracking-[-1px] mb-4">
            Отзывы наших клиентов
          </h1>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed max-w-[800px]">
            Узнайте, что говорят о нас клиенты, и поделитесь своим опытом.
          </p>
        </div>

        {/* Review form */}
        <div className="bg-[#f7ead8] rounded-[28px] p-6 sm:p-8 border border-[#C9A882] mb-10">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-4">
            Оставить отзыв
          </h2>

          {!user ? (
            <div className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/80 text-base">
              <p className="mb-4">Чтобы оставить отзыв, пожалуйста, авторизуйтесь.</p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="h-11 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-sm border-0 cursor-pointer transition-colors"
              >
                Войти
              </button>
            </div>
          ) : hasReview ? (
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/80 text-base">
              Вы уже оставили отзыв. Спасибо!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mb-2">
                  Ваша оценка
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="bg-transparent border-0 p-1 cursor-pointer"
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill={star <= (hoverRating || rating) ? "#a6856d" : "none"}
                        stroke="#a6856d"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm mb-2">
                  Ваш отзыв
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Расскажите о вашем опыте..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-[14px] border border-[#e3cbb1] bg-white [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-sm outline-none focus:border-[#a6856d] resize-none"
                />
              </div>

              {error && (
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-red-600 text-sm">{error}</p>
              )}
              {success && (
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-green-700 text-sm">{success}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="h-12 px-8 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base border-0 cursor-pointer transition-colors disabled:opacity-60"
              >
                {submitting ? "Отправка..." : "Отправить отзыв"}
              </button>
            </form>
          )}
        </div>

        {/* Reviews list */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60">
              Загрузка отзывов...
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-[#f7ead8] rounded-[28px] p-8 text-center border border-[#C9A882]">
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/70 text-base">
                Пока нет отзывов. Будьте первым!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#f7ead8] rounded-[28px] p-6 sm:p-8 border border-[#C9A882]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-lg">
                      {review.name}
                    </h3>
                    <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/50 text-sm">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size={20} />
                </div>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/90 text-base leading-relaxed">
                  {review.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
