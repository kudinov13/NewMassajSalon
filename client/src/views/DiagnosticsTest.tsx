import React, { useState } from "react";

interface Question {
  text: string;
  options: string[];
  scores: number[];
}

const placeholderQuestions: Record<string, Question[]> = {
  nails: [
    { text: "Как часто у вас ломаются ногти?", options: ["Очень редко", "Иногда", "Довольно часто", "Постоянно"], scores: [0, 1, 2, 3] },
    { text: "Есть ли у вас белые пятна на ногтях?", options: ["Нет", "Иногда появляются", "Есть несколько", "Много"], scores: [0, 1, 2, 3] },
    { text: "Какой цвет ваших ногтей?", options: ["Розовый, здоровый", "Слегка бледный", "Желтоватый", "Тёмный или синюшный"], scores: [0, 1, 2, 3] },
    { text: "Есть ли борозды или неровности?", options: ["Нет", "Едва заметные", "Заметные", "Ярко выраженные"], scores: [0, 1, 2, 3] },
    { text: "Как быстро растут ваши ногти?", options: ["Нормально", "Чуть медленнее", "Медленно", "Очень медленно"], scores: [0, 1, 2, 3] },
  ],
  tongue: [
    { text: "Какого цвета ваш язык утром?", options: ["Розовый", "Бледный", "Красный", "С налётом"], scores: [0, 1, 2, 3] },
    { text: "Есть ли налёт на языке?", options: ["Нет", "Тонкий белый", "Толстый белый", "Жёлтый или серый"], scores: [0, 1, 2, 3] },
    { text: "Есть ли трещины на языке?", options: ["Нет", "Мелкие", "Заметные", "Глубокие"], scores: [0, 1, 2, 3] },
    { text: "Ощущаете ли сухость во рту?", options: ["Нет", "Иногда", "Часто", "Постоянно"], scores: [0, 1, 2, 3] },
    { text: "Есть ли отпечатки зубов по краям?", options: ["Нет", "Едва заметные", "Заметные", "Ярко выраженные"], scores: [0, 1, 2, 3] },
  ],
  eyes: [
    { text: "Есть ли покраснение глаз?", options: ["Нет", "Иногда", "Часто", "Постоянно"], scores: [0, 1, 2, 3] },
    { text: "Есть ли желтизна белков?", options: ["Нет", "Слегка", "Заметная", "Выраженная"], scores: [0, 1, 2, 3] },
    { text: "Бывают ли отёки под глазами?", options: ["Нет", "Иногда утром", "Часто", "Постоянно"], scores: [0, 1, 2, 3] },
    { text: "Как быстро устают глаза?", options: ["Не устают", "К вечеру", "После обеда", "Быстро"], scores: [0, 1, 2, 3] },
    { text: "Есть ли тёмные круги под глазами?", options: ["Нет", "Едва заметные", "Заметные", "Ярко выраженные"], scores: [0, 1, 2, 3] },
  ],
  skin: [
    { text: "Как вы оцениваете состояние кожи?", options: ["Отличное", "Хорошее", "Удовлетворительное", "Плохое"], scores: [0, 1, 2, 3] },
    { text: "Есть ли высыпания на коже?", options: ["Нет", "Иногда", "Часто", "Постоянно"], scores: [0, 1, 2, 3] },
    { text: "Какова сухость вашей кожи?", options: ["Нормальная", "Слегка сухая", "Сухая", "Очень сухая"], scores: [0, 1, 2, 3] },
    { text: "Есть ли пигментные пятна?", options: ["Нет", "Мало", "Несколько", "Много"], scores: [0, 1, 2, 3] },
    { text: "Как реагирует кожа на солнце?", options: ["Нормально", "Легко краснеет", "Быстро обгорает", "Очень чувствительна"], scores: [0, 1, 2, 3] },
  ],
  body: [
    { text: "Бывают ли боли в спине?", options: ["Нет", "Иногда", "Часто", "Постоянно"], scores: [0, 1, 2, 3] },
    { text: "Симметричны ли ваши плечи?", options: ["Да", "Почти", "Одно выше", "Явная асимметрия"], scores: [0, 1, 2, 3] },
    { text: "Устаёте ли вы при длительном стоянии?", options: ["Нет", "Немного", "Довольно быстро", "Очень быстро"], scores: [0, 1, 2, 3] },
    { text: "Бывают ли головные боли от позы?", options: ["Нет", "Редко", "Иногда", "Часто"], scores: [0, 1, 2, 3] },
    { text: "Замечаете ли сутулость?", options: ["Нет", "Иногда", "Часто", "Постоянно"], scores: [0, 1, 2, 3] },
  ],
};

const diagTitles: Record<string, string> = {
  nails: "Диагностика ногтей",
  tongue: "Диагностика языка",
  eyes: "Диагностика глаз",
  skin: "Диагностика кожи",
  body: "Диагностика тела и осанки",
};

interface DiagnosticsTestProps {
  type: string;
  onClose: () => void;
}

const DiagnosticsTest: React.FC<DiagnosticsTestProps> = ({ type, onClose }) => {
  const questions = placeholderQuestions[type] || placeholderQuestions.nails;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [showResult, setShowResult] = useState(false);

  const totalQuestions = questions.length;
  const progress = (currentQuestion + 1) / totalQuestions;

  const handleNext = () => {
    if (selectedOption === -1) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = questions[currentQuestion].scores[selectedOption];
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(-1);
    } else {
      setShowResult(true);
    }
  };

  const totalScore = answers.reduce((sum, s) => sum + (s >= 0 ? s : 0), 0);
  const maxScore = totalQuestions * 3;

  const getResultText = () => {
    const percent = totalScore / maxScore;
    if (percent <= 0.25) return { title: "Отличный результат!", text: "Ваши показатели в норме. Продолжайте поддерживать здоровый образ жизни." };
    if (percent <= 0.5) return { title: "Хороший результат", text: "Есть незначительные отклонения. Рекомендуем обратить внимание на профилактику." };
    if (percent <= 0.75) return { title: "Требуется внимание", text: "Обнаружены заметные отклонения. Рекомендуем пройти консультацию специалиста." };
    return { title: "Необходима консультация", text: "Результаты указывают на серьёзные отклонения. Настоятельно рекомендуем обратиться к специалисту." };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#6B5744]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Decorative cards behind */}
      <div
        className="absolute w-[420px] h-[480px] rounded-[25px] bg-[#6B5744]/30"
        style={{ transform: "rotate(-6deg) translateY(20px) translateX(-15px)" }}
      />
      <div
        className="absolute w-[420px] h-[480px] rounded-[25px] bg-[#6B5744]/20"
        style={{ transform: "rotate(4deg) translateY(25px) translateX(10px)" }}
      />

      {/* Main card */}
      <div className="relative w-[420px] bg-[#f5e6d3] rounded-[25px] p-8 shadow-2xl z-10">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-[4px] rounded-full transition-colors ${
                i <= currentQuestion ? "bg-[#6B5744]" : "bg-[#6B5744]/20"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-[#6B5744]/30 bg-transparent text-[#6B5744] flex items-center justify-center cursor-pointer hover:bg-[#6B5744]/10 transition-colors ml-2 text-sm"
          >
            ✕
          </button>
        </div>

        {!showResult ? (
          <>
            {/* Question */}
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm mb-2">
              Тест: {diagTitles[type]}
            </p>
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl leading-tight mb-6">
              {questions[currentQuestion].text}
            </h2>

            {/* Options */}
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm mb-3">
              Варианты ответа:
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {questions[currentQuestion].options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedOption(i)}
                  className={`flex items-center gap-3 text-left px-4 py-3 rounded-[12px] border cursor-pointer transition-colors [font-family:'Vela_Sans',sans-serif] font-light text-base ${
                    selectedOption === i
                      ? "border-[#6B5744] bg-[#6B5744]/10 text-[#6B5744]"
                      : "border-[#6B5744]/20 bg-transparent text-[#6B5744] hover:bg-[#6B5744]/5"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selectedOption === i ? "border-[#6B5744]" : "border-[#6B5744]/30"
                  }`}>
                    {selectedOption === i && <span className="w-2.5 h-2.5 rounded-full bg-[#6B5744]" />}
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={selectedOption === -1}
              className={`w-full h-12 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base border-0 cursor-pointer transition-colors ${
                selectedOption === -1
                  ? "bg-[#6B5744]/20 text-[#6B5744]/40 cursor-not-allowed"
                  : "bg-[#6B5744] text-white hover:bg-[#5a4a38]"
              }`}
            >
              {currentQuestion < totalQuestions - 1 ? "Далее" : "Завершить"}
            </button>
          </>
        ) : (
          <>
            {/* Result */}
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#6B5744]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-[#6B5744]">{totalScore}/{maxScore}</span>
              </div>
              <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-3">
                {getResultText().title}
              </h2>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed mb-6">
                {getResultText().text}
              </p>
              <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm mb-6">
                Рекомендованный курс будет подобран специалистом.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 rounded-full bg-[#6B5744] text-white [font-family:'Vela_Sans',sans-serif] font-light text-base border-0 cursor-pointer hover:bg-[#5a4a38] transition-colors"
              >
                Закрыть
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsTest;
