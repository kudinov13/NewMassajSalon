import React, { FormEvent, useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../services/api";
import x2026013015045511 from "./2026-01-30-15-04-55-1-1.png";
import arrow1 from "./arrow-1.svg";
import arrow12 from "./arrow-1-2.svg";
import arrow13 from "./arrow-1-3.svg";
import arrow14 from "./arrow-1-4.svg";
import arrow15 from "./arrow-1-5.svg";
import arrow16 from "./arrow-1-6.svg";
import arrow17 from "./arrow-1-7.svg";
import arrow18 from "./arrow-1-8.svg";
import arrow2 from "./arrow-2.svg";
import image from "./image.svg";
import line1 from "./line-1.svg";
import line2 from "./line-2.svg";
import line3 from "./line-3.svg";
import rectangle2 from "./rectangle-2.png";
import rectangle13 from "./Rectangle 13.png";
import rectangle15 from "./rectangle-15.png";
import rectangle17 from "./rectangle-17.png";
import rectangle18 from "./rectangle-18.png";
import rectangle19 from "./rectangle-19.png";
import rectangle20 from "./rectangle-20.png";
import rectangle21 from "./rectangle-21.png";
import rectangle25 from "./rectangle-25.png";
import rectangle26 from "./rectangle-26.jpg";
import rectangle27 from "./rectangle-27.png";
import rectangle32 from "./rectangle-32.png";
import rectangle34 from "./rectangle-34.png";
import vector from "./vector.svg";
import vector2 from "./vector-2.svg";
import vector3 from "./vector-3.svg";
import vector4 from "./vector-4.svg";
import vector5 from "./vector-5.svg";
import tsitataIcon from "./tsitata_yr2c6veqh1hi 1.svg";

const navItems = [
  "Навигация",
  "Расписание",
  "Магазин",
  "О нас",
  "Отзывы",
];

const services = [
  {
    title: "Диагностика",
    description: "Комплексная диагностика организма по различным методикам",
    image: rectangle13,
    arrow: arrow15,
    type: "large",
    position: "absolute top-[1055px] left-10 w-[325px] h-[444px]",
    imageClass:
      "absolute top-[83px] left-[6px] w-[313px] h-[345px] aspect-[0.91] object-cover rounded-[20px]",
    titleClass:
      "absolute top-1 left-[13px] [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]",
    descriptionClass:
      "absolute top-[33px] left-[13px] w-[286px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-[15px] tracking-[-0.45px] leading-[normal]",
    cardBg: "bg-[#e3cbb1]",
    arrowWrapClass:
      "absolute top-3 left-[283px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]",
    arrowClass: "mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]",
  },
  {
    title: "Анализы",
    description:
      "Обследования помогают выявить проблемы со здоровьем на ранних стадиях.",
    image: rectangle15,
    arrow: arrow14,
    type: "small",
    position: "absolute top-[1056px] left-[385px] w-[329px] h-[215px]",
    imageClass:
      "absolute top-[87px] left-1.5 w-[313px] h-[122px] aspect-[2.57] object-cover rounded-[20px]",
    titleClass:
      "absolute top-[13px] left-5 [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]",
    descriptionClass:
      "absolute top-[39px] left-5 w-[298px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-sm tracking-[-0.42px] leading-[normal]",
    cardBg: "border-2 border-solid border-[#e3cbb1]",
    arrowWrapClass:
      "absolute top-3 left-[283px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]",
    arrowClass: "mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]",
  },
  {
    title: "Тибетские чаши",
    description: "Звуко-вибрационная терапия для гармонизации",
    image: rectangle17,
    arrow: arrow16,
    type: "small",
    position: "absolute top-[1285px] left-[385px] w-[329px] h-[215px]",
    imageClass:
      "absolute top-[87px] left-[5px] w-[313px] h-[122px] aspect-[2.57] object-cover rounded-[20px]",
    titleClass:
      "absolute top-3.5 left-5 [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]",
    descriptionClass:
      "absolute top-10 left-[21px] w-[298px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-sm tracking-[-0.42px] leading-[normal]",
    cardBg: "border-2 border-solid border-[#e3cbb1]",
    arrowWrapClass:
      "absolute top-2.5 left-[285px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]",
    arrowClass: "mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]",
  },
  {
    title: "Самомассаж",
    description: "Техники самомассажа для домашнего применения",
    image: rectangle18,
    arrow: arrow17,
    type: "small",
    position: "absolute top-[1056px] left-[730px] w-[329px] h-[215px]",
    imageClass:
      "absolute top-[87px] left-1.5 w-[313px] h-[122px] aspect-[2.57] rounded-[20px] object-cover",
    titleClass:
      "absolute top-3.5 left-5 [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]",
    descriptionClass:
      "absolute top-[41px] left-5 w-[298px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-sm tracking-[-0.42px] leading-[normal]",
    cardBg: "border-2 border-solid border-[#e3cbb1]",
    arrowWrapClass:
      "absolute top-2.5 left-[285px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]",
    arrowClass: "mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]",
  },
  {
    title: "Психология",
    description: "Психосоматика и консультации психолога",
    image: rectangle19,
    arrow: arrow18,
    type: "small",
    position: "absolute top-[1285px] left-[730px] w-[329px] h-[215px]",
    imageClass:
      "absolute top-[87px] left-1.5 w-[313px] h-[122px] aspect-[2.57] object-cover rounded-[20px]",
    titleClass:
      "absolute top-[13px] left-5 [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]",
    descriptionClass:
      "absolute top-[39px] left-5 [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-sm tracking-[-0.42px] leading-[normal]",
    cardBg: "border-2 border-solid border-[#e3cbb1]",
    arrowWrapClass:
      "absolute top-2.5 left-[285px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]",
    arrowClass: "mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]",
  },
  {
    title: "Прямые трансляции",
    description: "Онлайн-занятия и прямые эфиры с мастером",
    image: rectangle20,
    arrow: arrow1,
    type: "large",
    position: "absolute top-[1056px] left-[1075px] w-[329px] h-[444px]",
    imageClass:
      "absolute top-[93px] left-1.5 w-[313px] h-[345px] aspect-[0.91] object-cover rounded-[20px]",
    titleClass:
      "absolute top-3.5 left-[19px] [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]",
    descriptionClass:
      "absolute top-[41px] left-5 w-[298px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-sm tracking-[-0.42px] leading-[normal]",
    cardBg: "bg-[#e3cbb1]",
    arrowWrapClass:
      "absolute top-3 left-[283px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]",
    arrowClass: "mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]",
  },
];

const benefits = [
  {
    title: "Бесплатная диагностика",
    text: "При первой записи на консультацию",
    className: "absolute top-[1937px] left-10 w-[414px] h-[100px]",
    innerClass:
      "absolute top-0 left-0 w-[410px] h-[100px] bg-[#ffffff26] rounded-[25px] border-[none] shadow-[0px_4px_40px_#0000001a] backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[25px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.7)_0%,rgba(125,112,98,0.7)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none",
    titleClass:
      "top-2.5 left-[15px] [font-family:'Vela Sans',sans-serif] font-normal text-[#ffffffe6] absolute text-xl tracking-[-0.60px] leading-[normal]",
    textClass:
      "absolute top-[41px] left-4 w-[179px] [font-family:'Vela Sans',sans-serif] font-normal text-[#ffffffe6] text-base tracking-[-0.48px] leading-[normal]",
  },
  {
    title: "Курсы со скидкой",
    text: "Скидка 20% на все видео-курсы",
    className: "absolute top-[2046px] left-10 w-[204px] h-[100px]",
    innerClass:
      "absolute top-0 left-0 w-[200px] h-[100px] bg-[#ffffff26] rounded-[25px] border-[none] shadow-[0px_4px_40px_#0000001a] backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[25px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.7)_0%,rgba(125,112,98,0.7)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none",
    titleClass:
      "top-2.5 left-[15px] [font-family:'Vela Sans',sans-serif] font-normal text-[#ffffffe6] absolute text-xl tracking-[-0.60px] leading-[normal]",
    textClass:
      "absolute top-[43px] left-4 w-[159px] [font-family:'Vela Sans',sans-serif] font-normal text-[#ffffffe6] text-base tracking-[-0.48px] leading-[normal]",
  },
  {
    title: "Приведи друга",
    text: "Получи скидку 15% за рекомендацию",
    className: "absolute top-[2046px] left-[250px] w-[204px] h-[100px]",
    innerClass:
      "absolute top-0 left-0 w-[200px] h-[100px] bg-[#ffffff26] rounded-[25px] border-[none] shadow-[0px_4px_40px_#0000001a] backdrop-blur-[10px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(10px)_brightness(100%)] before:content-[''] before:absolute before:inset-0 before:p-px before:rounded-[25px] before:[background:linear-gradient(133deg,rgba(255,255,255,0.7)_0%,rgba(125,112,98,0.7)_100%)] before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor] before:[mask-composite:exclude] before:z-[1] before:pointer-events-none",
    titleClass:
      "top-2.5 left-[15px] [font-family:'Vela Sans',sans-serif] font-normal text-[#ffffffe6] absolute text-xl tracking-[-0.60px] leading-[normal]",
    textClass:
      "absolute top-[43px] left-[15px] w-[159px] [font-family:'Vela Sans',sans-serif] font-normal text-[#ffffffe6] text-base tracking-[-0.48px] leading-[normal]",
  },
];

const specialists = [
  {
    name: "Кюльпер Татьяна Альбертовна",
    image: rectangle25,
    imageClass:
      "absolute top-[2570px] left-10 w-[230px] h-[296px] aspect-[0.78] object-cover rounded-[25px]",
    textClass:
      "absolute top-[2871px] left-10 [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-base tracking-[-0.48px] leading-[normal]",
  },
  {
    name: "Тимкина Наталья Александровна",
    image: "/natalya.png",
    imageClass: "absolute top-[2570px] left-[287px] w-60 h-[296px] object-cover rounded-[25px]",
    textClass:
      "absolute top-[2871px] left-[287px] [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-base tracking-[-0.48px] leading-[normal]",
  },
  {
    name: "Коюшева Оксана Викторовна",
    image: rectangle27,
    imageClass:
      "absolute top-[2570px] left-[544px] w-[211px] h-[296px] aspect-[0.71] object-cover rounded-[25px]",
    textClass:
      "absolute top-[2871px] left-[544px] [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-base tracking-[-0.48px] leading-[normal]",
  },
];

const reviews = [
  {
    name: "Елена",
    date: "05.02.2025",
    text: "Пришла в студию с ощущением, что кожа потеряла тонус и сияние. Ксения подобрала комплексный уход с ультразвуковой чисткой и плазмотерапией. Уже после первой процедуры цвет лица стал свежее, а через месяц подруги спрашивали, где я отдыхала. Очень бережные руки, внимательность к моим ощущениям и никакой боли. Теперь только к ней!",
    cardClass:
      "absolute top-[2958px] left-[385px] w-[325px] h-[276px] rounded-[25px] border-2 border-solid border-[#e3cbb1]",
    titleClass:
      "absolute top-[2972px] left-[407px] [font-family:'Vela Sans',sans-serif] font-normal text-black text-xl tracking-[-0.60px] leading-[normal]",
    textClass:
      "absolute top-[3032px] left-[407px] w-[303px] [font-family:'Vela Sans',sans-serif] font-light text-black text-[15px] tracking-[-0.45px] leading-[normal]",
  },
  {
    name: "Марина",
    date: "12.11.2024",
    text: "Больше 5 лет боролась с высыпаниями и жирным блеском. Перепробовала всё — от аптечных болтушек до дорогих пилингов. Оксана посмотрела на мою кожу и сразу сказала: «Будем работать комплексно, но без фанатизма». Через 2 месяца регулярных уходов и коррекции домашнего ухода кожа наконец-то дышит, макияж держится идеально. Спасибо за терпение и настоящий результат!",
    cardClass:
      "absolute top-[2958px] left-[730px] w-[325px] h-[276px] rounded-[25px] border-2 border-solid border-[#e3cbb1]",
    titleClass:
      "left-[743px] absolute top-[2972px] [font-family:'Vela Sans',sans-serif] font-normal text-black text-xl tracking-[-0.60px] leading-[normal]",
    textClass:
      "absolute top-[3032px] left-[741px] w-[303px] [font-family:'Vela Sans',sans-serif] font-light text-black text-[15px] tracking-[-0.45px] leading-[normal]",
  },
  {
    name: "Анастасия",
    date: "20.09.2024",
    text: "Хочу сказать огромное спасибо Ирине Мороз за чуткость и профессионализм! Я долго не могла понять, почему при правильном питании вес стоит на месте. Оказалось, что мои любимые творог и бананы — в списке нерекомендованных продуктов. Заменили их, добавили поддержку, и за 3 месяца ушло 8 кг без голодовок и стресса. Наконец-то я перестала бояться еды!",
    cardClass:
      "absolute top-[2958px] left-[1079px] w-[325px] h-[276px] rounded-[25px] border-2 border-solid border-[#e3cbb1]",
    titleClass:
      "left-[1101px] absolute top-[2972px] [font-family:'Vela Sans',sans-serif] font-normal text-black text-xl tracking-[-0.60px] leading-[normal]",
    textClass:
      "absolute top-[3028px] left-[1090px] w-[303px] [font-family:'Vela Sans',sans-serif] font-light text-black text-[15px] tracking-[-0.45px] leading-[normal]",
  },
];

export const Frame = (): React.ReactElement => {
  const DESIGN_WIDTH = 1440;
  const DESIGN_HEIGHT = 4704;
  const nameId = useId();
  const phoneId = useId();
  const commentId = useId();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    comment: "",
  });
  const [address, setAddress] = useState<string>("г. Новосибирск, ул. Хмельницкого, 1");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<boolean>(false);
  const [addressDraft, setAddressDraft] = useState<string>("");
  const [diagFlipped, setDiagFlipped] = useState<boolean>(false);
  const [homeScale, setHomeScale] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    API.settings.get()
      .then((settings) => {
        if (settings.address) setAddress(settings.address);
      })
      .catch(() => {});

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
    let rafId = 0;
    const computeScale = () => {
      const next = Math.min(1, window.innerWidth / DESIGN_WIDTH);
      setHomeScale((prev) => (prev === next ? prev : next));
    };
    const onResize = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        computeScale();
      });
    };

    computeScale();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await API.auth.logout();
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (e) {
      // игнорируем
    }
  };

  const handleSaveAddress = async () => {
    try {
      const updated = await API.settings.update({ address: addressDraft });
      if (updated.address) setAddress(updated.address);
      setEditingAddress(false);
    } catch (e) {
      alert("Не удалось сохранить адрес");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className="bg-[#efdec5] w-full overflow-hidden relative"
      style={{ height: `${DESIGN_HEIGHT * homeScale}px` }}
    >
      {/* Full-width background blocks */}
      <div
        className="absolute top-[94px] left-0 right-0 w-screen h-[687px] bg-[#a6856d] pointer-events-none"
        aria-hidden="true"
        style={{ top: `${94 * homeScale}px`, height: `${687 * homeScale}px` }}
      />
      <div
        className="absolute left-0 right-0 w-screen h-[360px] bg-[#a6856d] pointer-events-none"
        aria-hidden="true"
        style={{ top: `${4344 * homeScale}px`, height: `${360 * homeScale}px` }}
      />
      <div
        className="absolute top-[4636px] left-0 right-0 w-screen h-[68px] bg-[#efdec5] pointer-events-none"
        aria-hidden="true"
        style={{ top: `${4636 * homeScale}px`, height: `${68 * homeScale}px` }}
      />

      {/* Full-width image */}
      <img
        loading="lazy"
        decoding="async"
        className="absolute left-0 right-0 w-screen object-cover object-top pointer-events-none"
        alt="Путь к здоровью и гармонии"
        src={rectangle21}
        style={{ top: `${1540 * homeScale}px`, height: `${810 * homeScale}px` }}
      />

      {/* Full-width map */}
      <iframe
        title="Карта проезда"
        className="absolute left-0 right-0 w-screen border-0"
        src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}&z=16`}
        loading="lazy"
        allow="geolocation"
        style={{ top: `${4048 * homeScale}px`, height: `${296 * homeScale}px` }}
      />

      <div
        className="relative w-[1440px] h-[4704px] z-10"
        style={{
          transform: `scale(${homeScale})`,
          transformOrigin: "top left",
          marginLeft: `calc((100vw - ${DESIGN_WIDTH * homeScale}px) / 2)`,
        }}
      >
      <main
        className="w-[1440px] mx-auto min-h-[4680px] relative"
        data-id="frame-root"
      >
      <img
        className="absolute top-[109px] left-[707px] w-[703px] h-[651px] aspect-[1.08] object-cover rounded-[25px]"
        alt="Специалист центра у окна"
        src={rectangle2}
      />
      <header className="absolute top-0 left-0 w-[1440px] h-[94px] flex items-center justify-center bg-[#efdec5]">
        <div className="h-[94px] w-[1440px] relative">
          <div
            className="absolute w-0 h-[28.69%] top-[35.11%] left-[40.35%]"
            aria-hidden="true"
          >
            <img
              className="absolute w-[93.45%] h-[100.00%] top-0 left-[6.55%]"
              alt=""
              src={vector}
            />
            <img
              className="absolute w-full h-[33.87%] top-[66.13%] left-0"
              alt=""
              src={image}
            />
            <img
              className="absolute w-[72.70%] h-[33.76%] top-[66.24%] left-[27.30%]"
              alt=""
              src={vector2}
            />
            <img
              className="absolute w-[31.05%] h-[33.83%] top-[66.17%] left-[68.95%]"
              alt=""
              src={vector3}
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
            <img
              className="h-[100px] w-auto object-contain"
              alt="Логотип Коосмо"
              src="/logo.svg"
            />
            <span className="[font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-[32px] tracking-[0] leading-[normal]">
              Коосмо
            </span>
          </div>
          <nav
            aria-label="Основная навигация"
            className="absolute top-[27px] left-[45px] w-[450px] h-[35px] flex items-center z-10"
          >
            <ul className="inline-flex w-full h-full items-center gap-[30px] list-none p-0 m-0">
              {navItems.map((item) => (
                <li
                  key={item}
                  className="relative w-fit [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-base tracking-[-0.48px] leading-[normal]"
                >
                  {item === "Магазин" || item === "Расписание" || item === "Навигация" ? (
                    <Link to={item === "Магазин" ? "/shop" : item === "Расписание" ? "/schedule" : "/guide"} className="bg-transparent border-none cursor-pointer p-0 no-underline text-inherit">
                      {item}
                    </Link>
                  ) : (
                    <button type="button" className="bg-transparent border-none cursor-pointer p-0 focus:outline-none">
                      {item}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          {isAuthenticated ? (
            <div className="absolute top-[27px] left-[1230px] flex items-center gap-2">
              <a
                href="https://vk.com/koosmo.zdrav.massag"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-[34px] h-[34px] items-center justify-center rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="ВКонтакте"
              >
                <svg width="20" height="20" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M532.6,720.8c-227.9,0-357.9-156.2-363.3-416.2h114.2c3.8,190.8,87.9,271.7,154.6,288.3V304.6h107.5v164.6c65.8-7.1,135-82.1,158.3-164.6h107.5c-17.8,86.5-70.8,161.7-146.3,207.5C749.4,554,811.7,630,836.3,720.8H718c-22.3-79.8-90.3-138.4-172.5-148.8v148.8C545.5,720.8,532.6,720.8,532.6,720.8z" fill="#a6856d"/>
                </svg>
              </a>
              <Link to="/profile" className="flex w-[34px] h-[34px] items-center justify-center rounded-full bg-[#a6856d] hover:bg-[#8d6e58] transition-colors no-underline" aria-label="Профиль">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-[34px] items-center justify-center px-6 bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors"
                aria-label="Выход"
              >
                <span className="[font-family:'Vela Sans',sans-serif] font-light text-white text-base tracking-[-0.48px] leading-[normal]">
                  Выход
                </span>
              </button>
            </div>
          ) : (
            <div className="absolute top-[27px] left-[1230px] flex items-center gap-2">
              <a
                href="https://vk.com/koosmo.zdrav.massag"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-[34px] h-[34px] items-center justify-center rounded-full border border-[#00000033] hover:border-[#a6856d] transition-colors no-underline"
                title="ВКонтакте"
              >
                <svg width="20" height="20" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M532.6,720.8c-227.9,0-357.9-156.2-363.3-416.2h114.2c3.8,190.8,87.9,271.7,154.6,288.3V304.6h107.5v164.6c65.8-7.1,135-82.1,158.3-164.6h107.5c-17.8,86.5-70.8,161.7-146.3,207.5C749.4,554,811.7,630,836.3,720.8H718c-22.3-79.8-90.3-138.4-172.5-148.8v148.8C545.5,720.8,532.6,720.8,532.6,720.8z" fill="#a6856d"/>
                </svg>
              </a>
              <Link
                to="/login"
                className="flex w-[89px] h-[34px] items-center justify-center bg-[#a6856d] rounded-[25px] hover:bg-[#8d6e58] transition-colors no-underline"
                aria-label="Вход"
              >
                <span className="[font-family:'Vela Sans',sans-serif] font-light text-white text-base tracking-[-0.48px] leading-[normal]">
                  Вход
                </span>
              </Link>
            </div>
          )}
          <div
            className="absolute top-[27px] left-[30px] w-[450px] h-[35px] bg-[#e3cbb1] rounded-[25px]"
            aria-hidden="true"
          />
        </div>
      </header>
      <section aria-labelledby="hero-title">
        <p
          id="hero-title"
          className="absolute top-[203px] left-[30px] w-[644px] whitespace-nowrap [font-family:'Vela Sans',sans-serif] font-normal text-[#000000b2] text-[55px] tracking-[-1.65px] leading-[normal]"
        >
          ОЗДОРОВИТЕЛЬНЫЙ <br />
          ЦЕНТР <br />
          ГАРМОНИИ ТЕЛА И ДУШИ
        </p>
        <p className="absolute top-[436px] left-[30px] w-[647px] [font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-xl tracking-[-1.00px] leading-[normal]">
          Профессиональная диагностика, массаж, психологическая поддержка и
          уникальные оздоровительные практики для вашего благополучия
        </p>
        <button
          type="button"
          className="absolute top-[719px] left-[30px] w-[327px] h-[41px] text-left"
          aria-label="Пройти диагностику"
          onClick={() => navigate('/diagnostics/booking')}
        >
          <div className="absolute top-0 left-0 w-[325px] h-[41px] bg-[#e3cbb1] rounded-[25px]" />
          <div className="absolute top-[7px] left-[29px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]">
            Пройти диагностику
          </div>
          <div className="absolute top-[5px] left-[283px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]">
            <img
              className="mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]"
              alt=""
              src={arrow12}
            />
          </div>
        </button>
        <Link
          to="/schedule"
          className="absolute top-[719px] left-[370px] w-[327px] h-[41px] text-left no-underline"
          aria-label="Записаться"
        >
          <div className="absolute top-0 left-0 w-[325px] h-[41px] bg-[#e3cbb1] rounded-[25px]" />
          <div className="absolute top-[7px] left-[29px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]">
            Записаться
          </div>
          <div className="absolute top-[5px] left-[282px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]">
            <img
              className="mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]"
              alt=""
              src={arrow2}
            />
          </div>
        </Link>
      </section>
      <section
        aria-labelledby="philosophy-title"
        className="flex w-[1363px] items-center justify-between absolute top-[851px] left-10"
      >
        <h2
          id="philosophy-title"
          className="relative w-[193px] mt-[-1.00px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-4xl tracking-[-1.08px] leading-[normal]"
        >
          Философия гармонии
        </h2>
        <p className="relative w-[1130px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-base tracking-[-0.48px] leading-[normal]">
          Наша философия строится на уважении к естественным ритмам вашего тела.
          Мы не просто снимаем мышечное напряжение — мы возвращаем вас к
          состоянию внутреннего равновесия, используя только безопасные и
          бережные техники. Мы создаем вокруг вас атмосферу уюта и доверия,
          минимизируя стресс и суету внешнего мира, чтобы каждая минута в нашем
          центре становилась шагом на пути к обновлению и наполнению жизненной
          силой.
        </p>
      </section>
      <section aria-labelledby="services-title">
        <h2 className="absolute top-[999px] left-[calc(50.00%_-_101px)] [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-4xl tracking-[-1.08px] leading-[normal]">
          Наши услуги
        </h2>
        {services.map((service) => (
          service.title === "Диагностика" ? (
            <div
              key={service.title}
              className={`${service.position}`}
              style={{ perspective: "1000px" }}
            >
              <div
                className="relative w-[325px] h-[444px] transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: diagFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <button
                  type="button"
                  aria-label={service.title}
                  onClick={() => setDiagFlipped(true)}
                  className="absolute inset-0 w-full h-full text-left p-0 border-0 bg-transparent cursor-pointer"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="absolute top-0 left-0 w-[325px] h-[444px] rounded-[25px] bg-[#e3cbb1]" />
                  <div className={service.titleClass}>{service.title}</div>
                  <p className={service.descriptionClass}>{service.description}</p>
                  <span className={service.arrowWrapClass} aria-hidden="true">
                    <img className={service.arrowClass} alt="" src={service.arrow} />
                  </span>
                  <img loading="lazy" decoding="async" className={service.imageClass} alt={service.title} src={service.image} />
                </button>
                {/* Back */}
                <div
                  className="absolute inset-0 w-full h-full rounded-[25px] bg-[#e3cbb1] p-5 flex flex-col"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="[font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-lg">Выберите диагностику</span>
                    <button
                      type="button"
                      onClick={() => setDiagFlipped(false)}
                      className="w-8 h-8 rounded-full bg-[#a6856d] text-white border-0 cursor-pointer flex items-center justify-center text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    {[
                      { label: "Диагностика ногтей", slug: "nails" },
                      { label: "Диагностика языка", slug: "tongue" },
                      { label: "Диагностика глаз", slug: "eyes" },
                      { label: "Диагностика кожи", slug: "skin" },
                      { label: "Диагностика тела и осанки", slug: "body" },
                    ].map((d) => (
                      <button
                        key={d.slug}
                        type="button"
                        onClick={() => navigate(`/diagnostics/${d.slug}`)}
                        className="w-full py-3 px-4 rounded-[15px] bg-white/60 hover:bg-white border-0 cursor-pointer text-left [font-family:'Vela Sans',sans-serif] font-light text-[#6B5744] text-[15px] transition-colors"
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              key={service.title}
              type="button"
              aria-label={service.title}
              onClick={() => {
                if (service.title === "Самомассаж") navigate("/shop?category=self-massage");
                if (service.title === "Тибетские чаши") navigate("/tibetan-bowls");
                if (service.title === "Анализы") navigate("/analyses");
                if (service.title === "Прямые трансляции") navigate("/streams");
                if (service.title === "Психология") navigate("/psychology");
              }}
              className={`${service.position} text-left p-0 border-0 bg-transparent cursor-pointer hover:opacity-90 transition-opacity`}
            >
              <div
                className={`absolute top-0 left-0 w-[325px] ${
                  service.type === "large" ? "h-[444px]" : "h-[215px]"
                } rounded-[25px] ${service.cardBg}`}
              />
              <div className={service.titleClass}>{service.title}</div>
              {service.title === "Психология" ? (
                <div className={service.descriptionClass}>
                  Психосоматика и консультации <br />
                  психолога
                </div>
              ) : (
                <p className={service.descriptionClass}>{service.description}</p>
              )}
              <span className={service.arrowWrapClass} aria-hidden="true">
                <img className={service.arrowClass} alt="" src={service.arrow} />
              </span>
              <img
                loading="lazy"
                decoding="async"
                className={service.imageClass}
                alt={service.title}
                src={service.image}
              />
            </button>
          )
        ))}
      </section>
      <section aria-labelledby="wellness-title">
        <div className="absolute top-[1645px] left-[calc(50.00%_-_681px)] w-[652px] h-[156px] flex flex-col items-center">
          <h2
            id="wellness-title"
            className="ml-[-3px] h-[134px] w-[647px] [font-family:'Bergamasco',serif] font-normal text-white text-[64px] tracking-[0] leading-[normal]"
          >
            ПУТЬ К ЗДОРОВЬЮ <br />И ГАРМОНИИ
          </h2>
          <p className="ml-[-175px] h-[22px] w-[477px] [font-family:'Vela Sans',sans-serif] font-light text-[#ffffffb2] text-base tracking-[-0.48px] leading-[normal]">
            Начни заботиться о себе с профессиональной поддержкой
          </p>
        </div>
        {benefits.map((benefit) => (
          <article key={benefit.title} className={benefit.className}>
            <div className={benefit.innerClass} />
            <div className={benefit.titleClass}>{benefit.title}</div>
            <p className={benefit.textClass}>{benefit.text}</p>
          </article>
        ))}
      </section>
      <section aria-labelledby="team-title">
        <h2 className="absolute top-[2430px] left-[38px] [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-4xl tracking-[-1.08px] leading-[normal]">
          Команда ведущих <br />
          профессионалов своего дела
        </h2>
        {specialists.map((specialist) => (
          <article key={specialist.name}>
            <img
              loading="lazy"
              decoding="async"
              className={specialist.imageClass}
              alt={specialist.name}
              src={specialist.image}
            />
            <h3 className={specialist.textClass}>{specialist.name}</h3>
          </article>
        ))}
      </section>
      <section aria-labelledby="reviews-title">
        <div className="absolute top-[2958px] left-10 w-[325px] h-[276px] rounded-[25px] border-2 border-solid border-[#e3cbb1]" />
        <h2 className="absolute top-[2961px] left-[49px] [font-family:'Vela Sans',sans-serif] font-normal text-black text-4xl tracking-[-1.08px] leading-[normal]">
          Нам доверяют <br />
          самое важное
        </h2>
        {reviews.map((review) => (
          <article key={review.name}>
            <div className={review.cardClass} />
            <h3 className={review.titleClass}>
              {review.name}
              <br />
              {review.date}
            </h3>
            <p className={review.textClass}>{review.text}</p>
          </article>
        ))}
      </section>
      <section aria-labelledby="space-title">
        <div className="flex w-[421px] h-[480px] items-start gap-2.5 pl-[19px] pr-[18px] pt-4 pb-5 absolute top-[3346px] left-[59px] rounded-[25px] border-2 border-solid border-[#e3cbb1]">
          <img
            loading="lazy"
            decoding="async"
            className="relative w-96 h-[444px] aspect-[0.86] object-cover rounded-[20px]"
            alt="Интерьер Harmony Spa"
            src={rectangle32}
          />
        </div>
        <h2 className="absolute top-[3422px] left-[595px] [font-family:'Bergamasco',serif] font-normal text-[#000000cc] text-[40px] tracking-[-1.20px] leading-[normal]">
          ТЁПЛЫЕ СЛОВА
          <br />О ПРОСТРАНСТВЕ
          <br />
          Harmony Spa
        </h2>
        <p className="absolute top-[3568px] left-[595px] w-[809px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-xl tracking-[-0.60px] leading-[normal]">
          Мягкий свет струится по стенам, дерево встречает теплом, воздух пьёт
          тишину. Лаконичность форм рождает уют, каждая линия здесь — кокон для
          твоего спокойствия.
        </p>
        <p className="absolute top-[3642px] left-[595px] w-[809px] [font-family:'Vela Sans',sans-serif] font-extralight text-[#00000099] text-xl tracking-[-0.60px] leading-[normal]">
          Интерьер дышит: фактура камня, бархат кресел, отражение в мягком
          зеркале. Это место, где время теряет счёт, звуки тают, а забота
          становится осязаемой. Не просто комната — пространство тихого
          преображения, где каждая мелочь шепчет: «Ты в безопасности».
        </p>
      </section>
      <section aria-labelledby="location-title">
        <h2 className="absolute top-[3934px] left-10 [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-4xl tracking-[-1.08px] leading-[normal]">
          Как нас найти
        </h2>
        <img
          className="absolute top-[3988px] left-[15px] w-[50px] h-[50px] object-contain"
          alt="Иконка локации"
          src="/logo.svg"
        />
        {editingAddress ? (
          <div className="absolute top-[3988px] left-[75px] flex items-center gap-2">
            <input
              type="text"
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
              className="w-[400px] h-[36px] px-3 [font-family:'Vela Sans',sans-serif] text-[#000000e6] text-xl border border-[#a6856d] rounded-md bg-white"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveAddress}
              className="h-[36px] px-4 bg-[#a6856d] text-white rounded-md [font-family:'Vela Sans',sans-serif]"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setEditingAddress(false)}
              className="h-[36px] px-4 border border-[#a6856d] text-[#000000e6] rounded-md [font-family:'Vela Sans',sans-serif]"
            >
              Отмена
            </button>
          </div>
        ) : (
          <div className="top-[3993px] left-[75px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] absolute text-xl tracking-[-0.60px] leading-[normal] flex items-center gap-3">
            <span>{address}</span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setAddressDraft(address);
                  setEditingAddress(true);
                }}
                className="text-base px-3 py-1 border border-[#a6856d] rounded-md hover:bg-[#a6856d] hover:text-white transition-colors"
              >
                Изменить
              </button>
            )}
          </div>
        )}
      </section>
      <section aria-labelledby="contact-title">
        <div className="absolute top-[4381px] left-[734px] [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-[32px] tracking-[0] leading-[normal]">
          Свяжитесь с нами
        </div>
        <form onSubmit={handleSubmit} className="absolute top-0 left-0">
          {!formData.name && (
            <label
              htmlFor={nameId}
              className="absolute top-[4435px] left-[734px] [font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-sm tracking-[0] leading-[normal] cursor-text pointer-events-none"
            >
              Имя
            </label>
          )}
          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, name: event.target.value }))
            }
            className="absolute top-[4435px] left-[734px] w-[440px] h-[28px] bg-transparent border-0 outline-none [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-sm tracking-[0] leading-[normal] z-10"
            aria-label="Имя"
          />
          {!formData.phone && (
            <label
              htmlFor={phoneId}
              className="absolute top-[4471px] left-[734px] [font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-sm tracking-[0] leading-[normal] cursor-text pointer-events-none"
            >
              Телефон
            </label>
          )}
          <input
            id={phoneId}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, phone: event.target.value }))
            }
            className="absolute top-[4471px] left-[734px] w-[440px] h-[28px] bg-transparent border-0 outline-none [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-sm tracking-[0] leading-[normal] z-10"
            aria-label="Телефон"
          />
          {!formData.comment && (
            <label
              htmlFor={commentId}
              className="absolute top-[4509px] left-[734px] [font-family:'Vela Sans',sans-serif] font-light text-[#00000099] text-sm tracking-[0] leading-[normal] cursor-text pointer-events-none"
            >
              Комментарий
            </label>
          )}
          <textarea
            id={commentId}
            name="comment"
            value={formData.comment}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, comment: event.target.value }))
            }
            className="absolute top-[4509px] left-[734px] w-[440px] h-[28px] resize-none bg-transparent border-0 outline-none [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-sm tracking-[0] leading-[normal] z-10"
            aria-label="Комментарий"
          />
          <div
            className="top-[4463px] absolute left-[734px] w-[440px] h-px bg-black pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="top-[4499px] absolute left-[734px] w-[440px] h-px bg-black pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="top-[4537px] absolute left-[734px] w-[440px] h-px bg-black pointer-events-none"
            aria-hidden="true"
          />
          <button
            type="submit"
            className="absolute top-[4565px] left-[734px] w-[325px] h-[41px]"
            aria-label="Отправить"
          >
            <div className="absolute top-0 left-0 w-[325px] h-[41px] bg-[#e3cbb1] rounded-[25px]" />
            <div className="absolute top-[7px] left-[29px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000e6] text-xl tracking-[-0.60px] leading-[normal]">
              Отправить
            </div>
            <div className="absolute top-[5px] left-[283px] w-[30px] h-[30px] flex bg-[#a6856d] rounded-[15px]">
              <img
                className="mt-2 w-[14.71px] h-[14.71px] ml-[7.3px]"
                alt=""
                src={arrow13}
              />
            </div>
          </button>
        </form>
      </section>
      <footer>
        <div className="inline-flex items-center gap-[26px] absolute top-[4661px] left-10">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Vela Sans',sans-serif] font-normal text-[#000000e6] text-xl tracking-[0] leading-[normal]">
            Контакты
          </div>
          <a
            href="tel:+79991234567"
            className="relative w-fit mt-[-1.00px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-xl tracking-[0] leading-[normal]"
          >
            +7 (999) 123-45-67
          </a>
          <a
            href="mailto:info@massage-salon.ru"
            className="relative w-fit mt-[-1.00px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-xl tracking-[0] leading-[normal]"
          >
            info@massage-salon.ru
          </a>
          <div className="relative w-fit mt-[-1.00px] [font-family:'Vela Sans',sans-serif] font-light text-[#000000b2] text-xl tracking-[0] leading-[normal]">
            Ежедневно 9:00 - 21:00
          </div>
        </div>
      </footer>
      <img
        className="absolute top-[821px] left-[1356px] w-[63px] h-[63px]"
        alt=""
        src={tsitataIcon}
        aria-hidden="true"
      />
    </main>
      </div>
    </div>
  );
};

export default Frame;
