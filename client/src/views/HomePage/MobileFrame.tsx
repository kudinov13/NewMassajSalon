import React, { FormEvent, useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import arrow1 from "./arrow-1.svg";
import arrow12 from "./arrow-1-2.svg";
import arrow13 from "./arrow-1-3.svg";
import arrow14 from "./arrow-1-4.svg";
import arrow15 from "./arrow-1-5.svg";
import arrow16 from "./arrow-1-6.svg";
import arrow17 from "./arrow-1-7.svg";
import arrow18 from "./arrow-1-8.svg";
import arrow2 from "./arrow-2.svg";
import rectangle2 from "./rectangle-2.png";
import rectangle13 from "./Rectangle 13.png";
import rectangle15 from "./rectangle-15.png";
import rectangle17 from "./rectangle-17.png";
import rectangle18 from "./rectangle-18.png";
import rectangle19 from "./rectangle-19.png";
import rectangle20 from "./rectangle-20.png";
import rectangle21 from "./rectangle-21.png";
import rectangle25 from "./rectangle-25.png";
import rectangle27 from "./rectangle-27.png";
import rectangle32 from "./rectangle-32.png";
import tsitataIcon from "./tsitata_yr2c6veqh1hi 1.svg";

const services = [
  { title: "Диагностика", description: "Комплексная диагностика организма по различным методикам", image: rectangle13, arrow: arrow15, route: "/diagnostics/booking" },
  { title: "Анализы", description: "Обследования помогают выявить проблемы со здоровьем на ранних стадиях.", image: rectangle15, arrow: arrow14, route: "/analyses" },
  { title: "Тибетские чаши", description: "Звуко-вибрационная терапия для гармонизации", image: rectangle17, arrow: arrow16, route: "/tibetan-bowls" },
  { title: "Видео курсы", description: "Обучающие видео курсы для домашнего применения", image: rectangle18, arrow: arrow17, route: "/shop?category=self-massage" },
  { title: "Психология", description: "Психосоматика и консультации психолога", image: rectangle19, arrow: arrow18, route: "/psychology" },
  { title: "Прямые трансляции", description: "Онлайн-занятия и прямые эфиры с мастером", image: rectangle20, arrow: arrow1, route: "/streams" },
];

const benefits = [
  { title: "Бесплатная диагностика", text: "При первой записи на консультацию" },
  { title: "Курсы со скидкой", text: "Скидка 20% на все видео-курсы" },
  { title: "Приведи друга", text: "Получи скидку 15% за рекомендацию" },
];

const specialists = [
  { name: "Кюльпер Татьяна Альбертовна", image: rectangle25 },
  { name: "Тимкина Наталья Александровна", image: "/natalya.webp" },
  { name: "Коюшева Оксана Викторовна", image: rectangle27 },
];

const reviews = [
  { name: "Елена", date: "05.02.2025", text: "Пришла в студию с ощущением, что кожа потеряла тонус и сияние. Татьяна подобрала комплексный уход с ультразвуковой чисткой и плазмотерапией. Уже после первой процедуры цвет лица стал свежее, а через месяц подруги спрашивали, где я отдыхала. Очень бережные руки, внимательность к моим ощущениям и никакой боли. Теперь только к ней!" },
  { name: "Марина", date: "12.11.2024", text: "Больше 5 лет боролась с высыпаниями и жирным блеском. Перепробовала всё. Татьяна посмотрела на мою кожу и сразу сказала: «Будем работать комплексно, но без фанатизма». Через 2 месяца регулярных уходов и коррекции домашнего ухода кожа наконец-то дышит, макияж держится идеально. Спасибо за терпение и настоящий результат!" },
  { name: "Анастасия", date: "20.09.2024", text: "Хочу сказать огромное спасибо Татьяне за чуткость и профессионализм! Я долго не могла понять, почему при правильном питании вес стоит на месте. Оказалось, что мои любимые творог и бананы в списке нерекомендованных продуктов. Заменили их, добавили поддержку, и за 3 месяца ушло 8 кг без голодовок и стресса." },
];

const MobileFrame: React.FC = () => {
  const nameId = useId();
  const phoneId = useId();
  const commentId = useId();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", phone: "", comment: "" });
  const [address, setAddress] = useState("г. Новосибирск, ул. Хмельницкого, 1");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    API.settings.get().then((s) => { if (s.address) setAddress(s.address); }).catch(() => {});
    API.user.getCurrentUser().then((u) => { if (u && u.isAdmin) setIsAdmin(true); }).catch(() => {});
  }, []);

  const handleSaveAddress = async () => {
    try { const u = await API.settings.update({ address: addressDraft }); if (u.address) setAddress(u.address); setEditingAddress(false); } catch { alert("Не удалось сохранить адрес"); }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactError(""); setContactSuccess("");
    if (!formData.name.trim()) { setContactError("Укажите ваше имя"); return; }
    if (!formData.comment.trim() || formData.comment.trim().length < 5) { setContactError("Сообщение слишком короткое"); return; }
    setContactLoading(true);
    try {
      await API.contact.send({ name: formData.name.trim(), phone: formData.phone.trim(), message: formData.comment.trim() });
      setContactSuccess("Спасибо! Ваше обращение отправлено.");
      setFormData({ name: "", phone: "", comment: "" });
    } catch (err: any) { setContactError(err.message || "Ошибка при отправке."); } finally { setContactLoading(false); }
  };

  return (
    <div className="bg-[#efdec5] w-full min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="px-4 pt-8 pb-10">
        <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000b2] text-[28px] leading-[1.15] tracking-[-0.84px]">
          ОЗДОРОВИТЕЛЬНЫЙ ЦЕНТР ГАРМОНИИ ТЕЛА И ДУШИ
        </h1>
        <p className="mt-4 [font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-base leading-[1.5]">
          Профессиональная диагностика, массаж, психологическая поддержка и уникальные оздоровительные практики для вашего благополучия
        </p>
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => navigate("/diagnostics/booking")}
            className="w-full h-12 bg-[#e3cbb1] rounded-full flex items-center justify-between px-5 border-0"
          >
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000e6] text-base">Пройти диагностику</span>
            <span className="w-8 h-8 flex items-center justify-center bg-[#a6856d] rounded-full">
              <img src={arrow12} alt="" className="w-3.5 h-3.5" />
            </span>
          </button>
          <Link
            to="/schedule"
            className="w-full h-12 bg-[#e3cbb1] rounded-full flex items-center justify-between px-5 no-underline"
          >
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000e6] text-base">Записаться</span>
            <span className="w-8 h-8 flex items-center justify-center bg-[#a6856d] rounded-full">
              <img src={arrow2} alt="" className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        <img
          src={rectangle2}
          alt="Специалист центра"
          className="mt-8 w-full h-[240px] object-cover rounded-[20px]"
          loading="lazy"
          decoding="async"
        />
      </section>

      {/* Philosophy */}
      <section className="px-4 py-8">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000e6] text-2xl tracking-[-0.72px] mb-3">
          Философия гармонии
        </h2>
        <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000e6] text-[15px] leading-[1.6]">
          Наша философия строится на уважении к естественным ритмам вашего тела. Мы не просто снимаем мышечное напряжение, мы возвращаем вас к состоянию внутреннего равновесия, используя только безопасные и бережные техники. Мы создаем вокруг вас атмосферу уюта и доверия, минимизируя стресс и суету внешнего мира.
        </p>
      </section>

      {/* Services */}
      <section className="px-4 py-8">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000e6] text-2xl tracking-[-0.72px] mb-5 text-center">
          Наши услуги
        </h2>
        <div className="flex flex-col gap-4">
          {services.map((s) => (
            <button
              key={s.title}
              onClick={() => navigate(s.route)}
              className="w-full text-left p-0 border-0 bg-transparent cursor-pointer"
            >
              <div className="bg-[#e3cbb1] rounded-[20px] p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-lg tracking-[-0.54px]">{s.title}</h3>
                    <p className="mt-1 [font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-sm leading-[1.4]">{s.description}</p>
                  </div>
                  <span className="w-8 h-8 flex items-center justify-center bg-[#a6856d] rounded-full flex-shrink-0 ml-3">
                    <img src={s.arrow} alt="" className="w-3.5 h-3.5" />
                  </span>
                </div>
                <img src={s.image} alt={s.title} className="w-full h-[140px] object-cover rounded-[15px]" loading="lazy" decoding="async" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Wellness banner */}
      <section className="relative">
        <img src={rectangle21} alt="Путь к здоровью и гармонии" className="w-full h-[280px] object-cover object-top" loading="lazy" decoding="async" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h2 className="[font-family:'Bergamasco',serif] font-normal text-white text-[32px] leading-[1.1] text-center">
            ПУТЬ К ЗДОРОВЬЮ И ГАРМОНИИ
          </h2>
          <p className="mt-2 [font-family:'Vela_Sans',sans-serif] font-light text-[#ffffffb2] text-sm text-center">
            Начни заботиться о себе с профессиональной поддержкой
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#a6856d] px-4 py-8">
        <div className="flex flex-col gap-3">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white/15 backdrop-blur-sm rounded-[20px] border border-white/20 p-4">
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-white text-base">{b.title}</h3>
              <p className="mt-1 [font-family:'Vela_Sans',sans-serif] font-light text-white/80 text-sm">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="px-4 py-8">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl tracking-[-0.72px] mb-5">
          Команда ведущих профессионалов своего дела
        </h2>
        <div className="flex flex-col gap-5">
          {specialists.map((sp) => (
            <article key={sp.name} className="flex flex-col gap-2">
              <img src={sp.image} alt={sp.name} className="w-full h-[280px] object-cover rounded-[20px]" loading="lazy" decoding="async" />
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-sm">{sp.name}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="px-4 py-8">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-black text-2xl tracking-[-0.72px] mb-5">
          Нам доверяют самое важное
        </h2>
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <article key={r.name} className="rounded-[20px] border-2 border-solid border-[#e3cbb1] p-4">
              <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-black text-base">
                {r.name}<br />
                <span className="font-light text-[#00000099] text-sm">{r.date}</span>
              </h3>
              <p className="mt-3 [font-family:'Vela_Sans',sans-serif] font-light text-black text-[14px] leading-[1.5]">
                {r.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Space */}
      <section className="px-4 py-8">
        <img src={rectangle32} alt="Интерьер Коосмо" className="w-full h-[300px] object-cover rounded-[20px]" loading="lazy" decoding="async" />
        <h2 className="mt-5 [font-family:'Bergamasco',serif] font-normal text-[#000000cc] text-[28px] leading-[1.15]">
          ТЁПЛЫЕ СЛОВА О ПРОСТРАНСТВЕ Коосмо
        </h2>
        <p className="mt-3 [font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-[15px] leading-[1.6]">
          Мягкий свет струится по стенам, дерево встречает теплом, воздух пьёт тишину. Лаконичность форм рождает уют, каждая линия здесь кокон для твоего спокойствия.
        </p>
        <p className="mt-3 [font-family:'Vela_Sans',sans-serif] font-extralight text-[#00000099] text-[15px] leading-[1.6]">
          Интерьер дышит: фактура камня, бархат кресел, отражение в мягком зеркале. Это место, где время теряет счёт, звуки тают, а забота становится осязаемой.
        </p>
      </section>

      {/* Location */}
      <section className="px-4 py-8">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-2xl tracking-[-0.72px] mb-4">
          Как нас найти
        </h2>
        <div className="flex items-start gap-3 mb-4">
          <img src="/logo.svg" alt="" className="w-8 h-8 object-contain flex-shrink-0 mt-1" />
          {editingAddress ? (
            <div className="flex flex-col gap-2 flex-1">
              <input type="text" value={addressDraft} onChange={(e) => setAddressDraft(e.target.value)} className="w-full h-9 px-3 text-[#000000e6] text-base border border-[#a6856d] rounded-md bg-white" autoFocus />
              <div className="flex gap-2">
                <button onClick={handleSaveAddress} className="h-9 px-4 bg-[#a6856d] text-white rounded-md text-sm">Сохранить</button>
                <button onClick={() => setEditingAddress(false)} className="h-9 px-4 border border-[#a6856d] text-[#000000e6] rounded-md text-sm">Отмена</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000e6] text-base">{address}</span>
              {isAdmin && <button onClick={() => { setAddressDraft(address); setEditingAddress(true); }} className="text-sm px-2 py-1 border border-[#a6856d] rounded-md text-[#6B5744]">Изменить</button>}
            </div>
          )}
        </div>
        <iframe
          title="Карта проезда"
          className="w-full h-[200px] rounded-[20px] border-0"
          src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}&z=16`}
          loading="lazy"
          allow="geolocation"
        />
      </section>

      {/* Contact form */}
      <section className="bg-[#a6856d] px-4 py-8">
        <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-white text-2xl mb-6">Свяжитесь с нами</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label htmlFor={nameId} className="[font-family:'Vela_Sans',sans-serif] font-light text-white/70 text-sm">Имя</label>
            <input
              id={nameId} name="name" type="text" autoComplete="name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full h-11 px-4 bg-white/10 border-b border-white/30 text-white text-base outline-none rounded-t-md [font-family:'Vela_Sans',sans-serif] font-light"
              aria-label="Имя"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={phoneId} className="[font-family:'Vela_Sans',sans-serif] font-light text-white/70 text-sm">Телефон</label>
            <input
              id={phoneId} name="phone" type="tel" autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="w-full h-11 px-4 bg-white/10 border-b border-white/30 text-white text-base outline-none rounded-t-md [font-family:'Vela_Sans',sans-serif] font-light"
              aria-label="Телефон"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={commentId} className="[font-family:'Vela_Sans',sans-serif] font-light text-white/70 text-sm">Комментарий</label>
            <textarea
              id={commentId} name="comment"
              value={formData.comment}
              onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value }))}
              className="w-full min-h-[60px] px-4 py-3 bg-white/10 border-b border-white/30 text-white text-base outline-none resize-none [font-family:'Vela_Sans',sans-serif] font-light"
              aria-label="Комментарий"
            />
          </div>
          <button
            type="submit" disabled={contactLoading}
            className="w-full h-12 bg-[#e3cbb1] rounded-full flex items-center justify-between px-5 disabled:opacity-60 border-0"
          >
            <span className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000e6] text-base">
              {contactLoading ? "Отправка..." : "Отправить"}
            </span>
            <span className="w-8 h-8 flex items-center justify-center bg-[#a6856d] rounded-full">
              <img src={arrow13} alt="" className="w-3.5 h-3.5" />
            </span>
          </button>
          {contactError && <p className="text-red-200 text-sm [font-family:'Vela_Sans',sans-serif]">{contactError}</p>}
          {contactSuccess && <p className="text-green-200 text-sm [font-family:'Vela_Sans',sans-serif]">{contactSuccess}</p>}
        </form>
        <div className="mt-6 [font-family:'Vela_Sans',sans-serif] font-normal text-white/80 text-[13px] leading-[1.7]">
          <p className="mb-2">Данная информация носит исключительно ознакомительный характер и не заменяет очной консультации врача.</p>
          <p>Мы делимся знаниями для расширения кругозора. Решения о здоровье принимайте только после разговора с врачом.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#efdec5] px-4 py-6">
        <div className="flex flex-col gap-3">
          <div className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#000000e6] text-base">Контакты</div>
          <a href="tel:+79095054658" className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-base no-underline">+7 (909) 505-46-58</a>
          <a href="mailto:oookoosmо@mail.ru" className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-base no-underline">oookoosmо@mail.ru</a>
          <div className="[font-family:'Vela_Sans',sans-serif] font-light text-[#000000b2] text-base">Ежедневно 9:00 - 21:00</div>
        </div>
        <div className="mt-4 [font-family:'Vela_Sans',sans-serif] font-light text-[#00000099] text-xs leading-[1.6]">
          ООО «КООСМО» ИНН 2204096914 ОГРН 1232200001406 659300, Алтайский край, г. Бийск, ул. Л. Толстого 149, кв. 1
        </div>
      </footer>
    </div>
  );
};

export default MobileFrame;
