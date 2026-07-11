import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const directions = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        <path d="M12 12 5.6 5.6" />
        <path d="M12 12V5" />
      </svg>
    ),
    text: "Фитотравы — натуральные составы для создания уютной атмосферы",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
    text: "Аромамасла — подбор вариантов для повседневного использования",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    text: "ЛФК — занятия лечебной физкультурой с учётом допустимых нагрузок",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-3.3 0-6.2-2.1-7.1-5.3" />
      </svg>
    ),
    text: "Массаж — ручной и виброакустический с тибетскими чашами",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M12 7v-2" />
        <path d="M12 19v-2" />
        <path d="M17 12h2" />
        <path d="M5 12h2" />
      </svg>
    ),
    text: "Психолог — поддержка в вопросах эмоционального состояния",
  },
];

const whyChoose = [
  { title: "Комплексный подход", desc: "Несколько направлений в одном месте: от натуральных продуктов до практик и консультаций." },
  { title: "Безопасность и качество", desc: "Контроль условий хранения, сопроводительная документация, проверенные партнёры." },
  { title: "Индивидуальный формат", desc: "Программы и подбор решений с учётом личных пожеланий." },
];

const momQuotes = [
  { title: "Про фитотравы/аромамасла", text: "Реализуем продукцию согласно разрешительной документации. Соблюдаем условия хранения и транспортировки. Рекомендации по применению носят справочный характер." },
  { title: "Про ЛФК", text: "Проводим занятия по ЛФК в оздоровительных целях. Комплекс упражнений подбирается с учётом индивидуальных предпочтений и допустимых нагрузок." },
  { title: "Про массаж", text: "Предлагаем сеансы массажа и виброакустических практик в оздоровительных и релаксационных целях. Перед посещением необходима консультация специалиста." },
  { title: "Про психолога", text: "Консультации психолога проводятся в рамках психологической поддержки и не являются психотерапевтической или медицинской помощью." },
];

const whatYouCan = [
  "Подобрать фитотравы и эфирные масла для создания спокойной атмосферы дома — с учётом правил безопасного использования.",
  "Посетить занятия ЛФК и сеансы массажа, чтобы снять напряжение и вернуть телу лёгкость: у нас доступны ручной массаж и виброакустические практики с тибетскими чашами и кварцевыми инструментами.",
  "Пообщаться с психологом, чтобы разобраться с тревогой, выстроить границы или просто выговориться в безопасном пространстве.",
];

const weOffer = [
  "Фитотравы и аромамасла для повседневного использования.",
  "Занятия ЛФК и сеансы массажа (ручной, виброакустический с чашами и кварцем).",
  "Консультации психолога.",
];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#efdec5] min-h-screen w-full overflow-x-hidden">
      <Header />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 pb-20">
        {/* Hero */}
        <section className="pt-10 pb-6 text-center">
          <h1 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-3xl sm:text-4xl md:text-5xl tracking-[-1px] leading-tight mb-4 text-center">
            Гармония тела и спокойствия
          </h1>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base sm:text-lg max-w-[720px] mx-auto leading-relaxed">
            ООО «КООСМО» объединяет натуральные решения для здорового образа жизни и профессиональные оздоровительные практики. Мы помогаем клиентам сформировать комфортную среду для восстановления сил и поддержания хорошего самочувствия.
          </p>
        </section>

        {/* Intro card */}
        <section className="bg-[#f7ead8] rounded-[28px] p-6 sm:p-10 mb-8 border border-[#C9A882]">
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed mb-4">
            В нашем ассортименте товары — фитотравы и аромамасла: подбираем варианты для создания уютной атмосферы и повседневного использования с учётом общепринятых рекомендаций по применению.
          </p>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed mb-4">
            Наши специалисты проводят занятия по лечебной физкультуре (ЛФК) и сеансы массажа: ручного, а также виброакустического с применением тибетских поющих чаш и кварцевых инструментов. Программы строятся по индивидуальным предпочтениям и с учётом допустимых нагрузок.
          </p>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed mb-4">
            Дополнительно предлагаем консультации психолога — пространство, где можно обсудить волнующие вопросы и найти способы эмоциональной разгрузки.
          </p>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed">
            Мы строго соблюдаем требования к хранению и реализации продукции, работаем только с проверенными поставщиками и используем прозрачные условия сотрудничества.
          </p>
        </section>

        {/* Why choose */}
        <section className="mb-10">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6 text-center">
            Почему выбирают ООО «КООСМО»
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {whyChoose.map((item) => (
              <div key={item.title} className="bg-[#f7ead8] rounded-[28px] p-6 border border-[#C9A882]">
                <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-lg mb-2">
                  {item.title}
                </h3>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-[#f7ead8] rounded-[20px] p-5 sm:p-6 mb-10 border border-[#C9A882]/40">
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed text-center">
            Перед применением продукции и посещением практик необходима консультация специалиста. Представленные услуги не являются лечением и не заменяют врачебные назначения.
          </p>
        </section>

        {/* Space for self-care */}
        <section className="bg-[#f7ead8] rounded-[28px] p-6 sm:p-10 mb-10 border border-[#C9A882]">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl sm:text-3xl tracking-[-1px] mb-5">
            ООО «КООСМО»: пространство заботы о себе
          </h2>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed mb-6">
            Иногда самое важное — дать себе время на восстановление, услышать своё тело и почувствовать внутреннюю опору. ООО «КООСМО» создаёт условия для этого: натуральные продукты, мягкие практики и поддержка специалиста.
          </p>

          <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-4">
            С нами вы можете:
          </h3>
          <ul className="list-disc list-inside [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed space-y-2 mb-6">
            {whatYouCan.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>

          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed mb-6">
            Наша команда подбирает решения так, чтобы они органично вписывались в ваш ритм жизни. Мы не обещаем мгновенных чудес, но делаем всё, чтобы процесс был комфортным, понятным и безопасным.
          </p>

          <div className="bg-[#f7ead8] rounded-[18px] p-5 border border-[#C9A882]/40">
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed">
              Продукция и практики не предназначены для лечения заболеваний. Перед применением любых средств и посещением сеансов необходима консультация врача.
            </p>
          </div>
        </section>

        {/* We offer */}
        <section className="mb-10">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-5">
            Мы предлагаем
          </h2>
          <div className="bg-[#f7ead8] rounded-[28px] p-6 border border-[#C9A882]">
            <ul className="list-disc list-inside [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed space-y-2 mb-4">
              {weOffer.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed">
              Работаем с вниманием к качеству и безопасности: вся продукция сопровождается необходимой документацией, практики проводятся специалистами.
            </p>
          </div>
        </section>

        {/* Mom quotes */}
        <section className="mb-10">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-5">
            От основателя
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {momQuotes.map((q) => (
              <div key={q.title} className="bg-[#f7ead8] rounded-[28px] p-5 border border-[#C9A882]">
                <h3 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#a6856d] text-base mb-2">
                  {q.title}
                </h3>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed italic">
                  «{q.text}»
                </p>
              </div>
            ))}
          </div>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base mt-5">
            Мы работаем с января 2023 года.
          </p>
        </section>

        {/* Directions */}
        <section className="mb-10">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-5 text-center">
            Направления
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {directions.map((d, i) => (
              <div key={i} className="bg-[#f7ead8] rounded-[28px] p-5 flex items-start gap-4 border border-[#C9A882]">
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#a6856d]/10 flex-shrink-0">
                  {d.icon}
                </span>
                <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed pt-2">
                  {d.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How we work */}
        <section className="mb-10">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-6 text-center">
            Как мы работаем
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {["Консультация", "Подбор", "Проведение / Выдача"].map((step, i) => (
              <React.Fragment key={step}>
                <div className="bg-[#a6856d] text-white rounded-full px-6 py-3 [font-family:'Vela_Sans',sans-serif] font-light text-base text-center whitespace-nowrap">
                  {step}
                </div>
                {i < 2 && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block flex-shrink-0">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
                {i < 2 && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a6856d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block sm:hidden flex-shrink-0 rotate-90">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="bg-[#f7ead8] rounded-[20px] p-6 mb-10 border border-[#C9A882]/40 text-center">
          <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-xl mb-2">
            Безопасность
          </h2>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed">
            Соблюдаем требования к хранению и реализации. Продукция сопровождается документами.
          </p>
        </section>

        {/* Big disclaimer */}
        <section className="bg-[#f7ead8] rounded-[28px] p-6 sm:p-8 mb-12 border border-[#C9A882] text-center">
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-lg leading-relaxed">
            Перед применением средств и посещением практик проконсультируйтесь со специалистом. Услуги не являются медицинской помощью.
          </p>
        </section>

        {/* Back to home */}
        <section className="flex justify-center mb-10">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="h-12 px-8 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base border-0 cursor-pointer transition-colors"
          >
            На главную
          </button>
        </section>

        {/* Footer legal */}
        <footer className="border-t border-[#C9A882]/40 pt-8 pb-4 text-center">
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/80 text-sm mb-2">
            ОГРН 1232200001406
          </p>
          <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/80 text-sm">
            ООО «КООСМО» ИНН/КПП 2204096914 / 220401001
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;
