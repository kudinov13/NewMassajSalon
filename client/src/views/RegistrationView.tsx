import React, { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API, BASE_URL } from "../services/api";
import SafeInput from "../components/SafeInput";

const RegistrationView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFormReady(true));
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fd = new FormData(e.currentTarget);
    const login = String(fd.get("login") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const passwordConfirm = String(fd.get("passwordConfirm") ?? "");
    const fullName = String(fd.get("fullName") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();

    if (!login || !password) {
      setError("Заполните логин и пароль");
      return;
    }
    if (!fullName) {
      setError("Укажите ваше ФИО");
      return;
    }
    if (!phone) {
      setError("Укажите номер телефона");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    setSubmitting(true);
    try {
      await API.user.register({ login, password, fullName, phone, email });
      setSuccess("Аккаунт создан! Перенаправляем на страницу входа...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-[44px] px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-base focus:outline-none focus:border-[#a6856d] transition-colors";

  return (
    <div className="min-h-screen w-full bg-[#efdec5] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="w-full max-w-[440px] bg-white/60 border-2 border-[#e3cbb1] rounded-[25px] p-5 sm:p-10 shadow-lg">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] hover:text-[#a6856d] transition-colors no-underline"
        >
          <img src="/logo.svg" alt="Коосмо" className="h-[32px] w-auto" />
          <span className="text-xl">Коосмо</span>
        </Link>

        <h1 className="[font-family:'Bergamasco',serif] text-[#000000cc] text-[28px] sm:text-[40px] tracking-[-1.20px] leading-tight mb-2">
          Создать аккаунт
        </h1>
        <p className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base mb-8">
          Зарегистрируйтесь, чтобы пользоваться личным кабинетом
        </p>

        {formReady ? (
          <form
            key={location.key}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            autoComplete="off"
            noValidate
          >
            <label className="flex flex-col gap-2">
              <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
                ФИО <span className="text-red-400">*</span>
              </span>
              <SafeInput
                name="fullName"
                type="text"
                autoComplete="off"
                placeholder="Иванов Иван Иванович"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
                Телефон <span className="text-red-400">*</span>
              </span>
              <SafeInput
                name="phone"
                type="tel"
                autoComplete="off"
                placeholder="+7 (999) 123-45-67"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
                Email
              </span>
              <SafeInput
                name="email"
                type="email"
                autoComplete="off"
                placeholder="example@mail.ru"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
                Логин <span className="text-red-400">*</span>
              </span>
              <SafeInput name="login" type="text" autoComplete="off" className={inputClass} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
                Пароль <span className="text-red-400">*</span>
              </span>
              <SafeInput
                name="password"
                type="password"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
                Подтвердите пароль <span className="text-red-400">*</span>
              </span>
              <SafeInput
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>

            {error && (
              <div className="[font-family:'Vela Sans',sans-serif] font-light text-red-700 text-sm bg-red-50 border border-red-200 rounded-[15px] px-4 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="[font-family:'Vela Sans',sans-serif] font-light text-green-700 text-sm bg-green-50 border border-green-200 rounded-[15px] px-4 py-2">
                {success}
              </div>
            )}

            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer select-none mt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 w-5 h-5 min-w-[20px] accent-[#a6856d] rounded cursor-pointer"
              />
              <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-xs sm:text-sm leading-relaxed">
                Я принимаю условия{" "}
                <a href={`${BASE_URL}/docs/dobrovolnoe_soglasie.pdf`} target="_blank" rel="noopener noreferrer" className="text-[#a6856d] hover:underline font-normal">
                  Добровольного согласия на исследования
                </a>,{" "}
                <a href={`${BASE_URL}/docs/politika_konfidentsialnosti.pdf`} target="_blank" rel="noopener noreferrer" className="text-[#a6856d] hover:underline font-normal">
                  Политики конфиденциальности
                </a>,{" "}
                <a href={`${BASE_URL}/docs/oferta.pdf`} target="_blank" rel="noopener noreferrer" className="text-[#a6856d] hover:underline font-normal">
                  Предварительной оферты на участие
                </a>{" "}и{" "}
                <a href={`${BASE_URL}/docs/soglasie_obrabotka_dannyh.pdf`} target="_blank" rel="noopener noreferrer" className="text-[#a6856d] hover:underline font-normal">
                  Согласия на обработку персональных данных
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !consent}
              className="h-[48px] mt-2 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-[25px] [font-family:'Vela Sans',sans-serif] text-lg tracking-[-0.5px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Создание..." : "Зарегистрироваться"}
            </button>
          </form>
        ) : (
          <div className="h-[420px] flex items-center justify-center [font-family:'Vela Sans',sans-serif] text-[#00000099] text-sm">
            Загрузка формы...
          </div>
        )}

        <div className="mt-6 text-center [font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-[#a6856d] hover:underline font-normal">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegistrationView;
