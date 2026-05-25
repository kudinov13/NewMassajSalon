import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../services/api";

const RegistrationView = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!login.trim() || !password.trim()) {
      setError("Заполните логин и пароль");
      return;
    }
    if (!fullName.trim()) {
      setError("Укажите ваше ФИО");
      return;
    }
    if (!phone.trim()) {
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
      await API.user.register({ login: login.trim(), password, fullName: fullName.trim(), phone: phone.trim(), email: email.trim() });
      setSuccess("Аккаунт создан! Перенаправляем на страницу входа...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#efdec5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px] bg-white/60 border-2 border-[#e3cbb1] rounded-[25px] p-10 shadow-lg">
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] hover:text-[#a6856d] transition-colors no-underline"
        >
          <img src="/logo.svg" alt="Коосмо" className="h-[32px] w-auto" />
          <span className="text-xl">Коосмо</span>
        </Link>

        <h1 className="[font-family:'Bergamasco',serif] text-[#000000cc] text-[40px] tracking-[-1.20px] leading-tight mb-2">
          Создать аккаунт
        </h1>
        <p className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base mb-8">
          Зарегистрируйтесь, чтобы пользоваться личным кабинетом
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
              ФИО <span className="text-red-400">*</span>
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Иванов Иван Иванович"
              className="h-[44px] px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-base focus:outline-none focus:border-[#a6856d] transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
              Телефон <span className="text-red-400">*</span>
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+7 (999) 123-45-67"
              className="h-[44px] px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-base focus:outline-none focus:border-[#a6856d] transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="example@mail.ru"
              className="h-[44px] px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-base focus:outline-none focus:border-[#a6856d] transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
              Логин <span className="text-red-400">*</span>
            </span>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              className="h-[44px] px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-base focus:outline-none focus:border-[#a6856d] transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
              Пароль <span className="text-red-400">*</span>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="h-[44px] px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-base focus:outline-none focus:border-[#a6856d] transition-colors"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-base">
              Подтвердите пароль <span className="text-red-400">*</span>
            </span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              className="h-[44px] px-4 bg-white border-2 border-[#e3cbb1] rounded-[15px] [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-base focus:outline-none focus:border-[#a6856d] transition-colors"
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

          <button
            type="submit"
            disabled={submitting}
            className="h-[48px] mt-2 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-[25px] [font-family:'Vela Sans',sans-serif] text-lg tracking-[-0.5px] transition-colors disabled:opacity-60"
          >
            {submitting ? "Создание..." : "Зарегистрироваться"}
          </button>
        </form>

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