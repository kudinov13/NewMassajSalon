import React, { useEffect, useState } from "react";
import { API } from "../services/api";

interface Option {
  id: number;
  text: string;
  score: number;
  sortOrder: number;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

interface TestData {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  questions: Question[];
}

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
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    API.diagnosticsTests.getPublic(type)
      .then((data: TestData) => {
        setTest(data);
        setSelectedOptionIds(new Array(data.questions.length).fill(-1));
      })
      .catch(() => {
        setError("Не удалось загрузить тест. Попробуйте позже.");
      })
      .finally(() => setLoading(false));
  }, [type]);

  const questions = test?.questions || [];
  const totalQuestions = questions.length;

  const handleSelect = (optionId: number) => {
    const next = [...selectedOptionIds];
    next[currentQuestion] = optionId;
    setSelectedOptionIds(next);
  };

  const currentSelectedId = selectedOptionIds[currentQuestion] ?? -1;

  const handleNext = () => {
    if (currentSelectedId === -1) return;

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    if (!test) return;

    const selectedScores: number[] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const option = q.options.find((o) => o.id === selectedOptionIds[i]);
      selectedScores.push(option?.score || 0);
    }

    const totalScore = selectedScores.reduce((sum, s) => sum + s, 0);

    try {
      const resultData = await API.diagnosticsTests.evaluate(test.slug, totalScore);
      setResult(resultData);
    } catch (e: any) {
      setResult({
        title: "Результат получен",
        text: `Вы набрали ${totalScore} баллов. Спасибо за прохождение теста.`,
        isSeriousProblem: 0,
      });
    }
    setShowResult(true);
  };

  const selectedOptionIndex = questions[currentQuestion]?.options.findIndex(
    (o) => o.id === currentSelectedId
  );

  const totalScore = questions.reduce((sum, q, i) => {
    const option = q.options.find((o) => o.id === selectedOptionIds[i]);
    return sum + (option?.score || 0);
  }, 0);

  const maxScore = questions.reduce((sum, q) => {
    const max = Math.max(...q.options.map((o) => o.score), 0);
    return sum + max;
  }, 0);

  const resultButtons = () => {
    if (!result) return null;
    const bookingLink = result.buttonLink || "/diagnostics/booking";
    const bookingLabel = result.buttonLabel || "Записаться на диагностику";

    return (
      <div className="flex flex-col gap-3 mt-6">
        {result.isSeriousProblem ? (
          <>
            <a
              href={bookingLink}
              className="inline-flex items-center justify-center h-12 px-6 bg-[#a6856d] hover:bg-[#8d6e58] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base no-underline transition-colors"
            >
              {bookingLabel}
            </a>
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-6 border border-[#6B5744]/30 text-[#6B5744] rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base bg-transparent cursor-pointer hover:bg-[#6B5744]/10 transition-colors"
            >
              Вернуться на главную
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-6 bg-[#6B5744] text-white rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base border-0 cursor-pointer hover:bg-[#5a4a38] transition-colors"
          >
            Вернуться на главную
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#6B5744]/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="absolute hidden sm:block w-[420px] h-[480px] rounded-[25px] bg-[#6B5744]/30"
        style={{ transform: "rotate(-6deg) translateY(20px) translateX(-15px)" }}
      />
      <div
        className="absolute hidden sm:block w-[420px] h-[480px] rounded-[25px] bg-[#6B5744]/20"
        style={{ transform: "rotate(4deg) translateY(25px) translateX(10px)" }}
      />

      <div className="relative w-full max-w-[420px] bg-[#f5e6d3] rounded-[25px] p-5 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 [font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]">
            Загрузка...
          </div>
        ) : error ? (
          <div className="text-center py-10 [font-family:'Vela_Sans',sans-serif] font-light text-red-700">
            {error}
            <button
              type="button"
              onClick={onClose}
              className="mt-4 h-10 px-5 bg-[#6B5744] text-white rounded-full text-sm border-0 cursor-pointer hover:bg-[#5a4a38]"
            >
              Закрыть
            </button>
          </div>
        ) : !showResult ? (
          <>
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

            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm mb-2">
              Тест: {test?.title || diagTitles[type]}
            </p>
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl leading-tight mb-6">
              {questions[currentQuestion]?.text}
            </h2>

            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744]/60 text-sm mb-3">
              Варианты ответа:
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {questions[currentQuestion]?.options.map((option, i) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                  className={`flex items-center gap-3 text-left px-4 py-3 rounded-[12px] border cursor-pointer transition-colors [font-family:'Vela_Sans',sans-serif] font-light text-base ${
                    selectedOptionIndex === i
                      ? "border-[#6B5744] bg-[#6B5744]/10 text-[#6B5744]"
                      : "border-[#6B5744]/20 bg-transparent text-[#6B5744] hover:bg-[#6B5744]/5"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selectedOptionIndex === i ? "border-[#6B5744]" : "border-[#6B5744]/30"
                  }`}>
                    {selectedOptionIndex === i && <span className="w-2.5 h-2.5 rounded-full bg-[#6B5744]" />}
                  </span>
                  {option.text}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentSelectedId === -1}
              className={`w-full h-12 rounded-full [font-family:'Vela_Sans',sans-serif] font-light text-base border-0 cursor-pointer transition-colors ${
                currentSelectedId === -1
                  ? "bg-[#6B5744]/20 text-[#6B5744]/40 cursor-not-allowed"
                  : "bg-[#6B5744] text-white hover:bg-[#5a4a38]"
              }`}
            >
              {currentQuestion < totalQuestions - 1 ? "Далее" : "Завершить"}
            </button>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#6B5744]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-[#6B5744]">{totalScore}/{maxScore}</span>
            </div>
            <h2 className="[font-family:'Vela_Sans',sans-serif] font-normal text-[#6B5744] text-2xl mb-3">
              {result?.title || "Результат"}
            </h2>
            <p className="[font-family:'Vela_Sans',sans-serif] font-light text-[#6B5744] text-base leading-relaxed whitespace-pre-wrap">
              {result?.text || "Спасибо за прохождение теста."}
            </p>
            {resultButtons()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsTest;
