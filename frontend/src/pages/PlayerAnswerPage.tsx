import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

const buttonColors = [
  'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
  'bg-red-500 hover:bg-red-600 active:bg-red-700',
  'bg-green-500 hover:bg-green-600 active:bg-green-700',
  'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
];

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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Время вышло!</h2>
          <p className="text-gray-500">Ждём следующий вопрос...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col p-4">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/80 text-sm">
            Вопрос {currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
          </span>
          <span
            className={`text-white font-bold text-lg ${timeLeft <= 10 ? 'text-red-300 animate-pulse' : ''}`}
          >
            {timeLeft}с
          </span>
        </div>

        <div className="w-full bg-white/20 rounded-full h-2 mb-6">
          <div
            className="bg-white h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / currentQuestion.timeLeft) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 text-center">{currentQuestion.text}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(letters[index])}
              disabled={selected !== null}
              className={`${buttonColors[index]} text-white font-semibold rounded-xl py-6 px-4 text-lg transition-all duration-200 flex flex-col items-center justify-center ${
                selected === letters[index]
                  ? 'ring-4 ring-white scale-95'
                  : selected !== null
                    ? 'opacity-50'
                    : ''
              }`}
            >
              <span className="text-sm opacity-75 mb-1">{letters[index]}</span>
              <span className="text-center">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
