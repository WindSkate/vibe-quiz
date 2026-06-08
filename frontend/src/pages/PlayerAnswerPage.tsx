import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

const letters = ['A', 'B', 'C', 'D'];

export default function PlayerAnswerPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentQuestion, submitAnswer, phase } = usePlayerStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (phase === 'results') {
      navigate(`/player/${code}/results`);
      return;
    }
    if (phase === 'answer_reveal') {
      navigate(`/player/${code}/answer-reveal`);
      return;
    }
  }, [phase, navigate, code]);

  useEffect(() => {
    if (!currentQuestion) {
      setTimeLeft(0);
      setSelected(null);
      return;
    }

    setTimeLeft(currentQuestion.timeLeft);
    setSelected(null);
  }, [currentQuestion]);

  useEffect(() => {
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  const handleAnswer = (answer: string) => {
    if (selected) return;
    setSelected(answer);
    submitAnswer(answer);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Время вышло!</h2>
          <p className="text-gray-400">Ждём следующий вопрос...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-900/80 backdrop-blur">
        <span className="text-sm text-gray-400">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <span
          className={`text-lg font-bold tabular-nums ${
            timeLeft <= 10 ? 'text-red-400' : 'text-gray-300'
          }`}
        >
          {timeLeft}с
        </span>
      </div>

      <div className="flex gap-1 px-4 py-2 justify-center">
        {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < currentQuestion.questionNumber - 1
                ? 'bg-purple-500'
                : i === currentQuestion.questionNumber - 1
                  ? 'bg-white'
                  : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col px-4 py-3 gap-4 overflow-y-auto">
        <h2 className="text-lg font-medium text-center leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="flex flex-col gap-2 mt-2">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selected !== null}
              className={`flex items-center gap-3 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-4 text-left transition-all duration-200 ${
                selected === option
                  ? 'border-purple-500 bg-purple-500/20 ring-1 ring-purple-500/50'
                  : selected !== null
                    ? 'opacity-40'
                    : 'active:bg-gray-700/60'
              }`}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-300">
                {letters[index]}
              </span>
              <span className="text-base">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
