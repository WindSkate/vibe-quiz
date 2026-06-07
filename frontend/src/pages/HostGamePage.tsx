import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

const letters = ['A', 'B', 'C', 'D'];

export default function HostGamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentQuestion, timeLeft, phase } = useHostStore();

  useEffect(() => {
    if (phase === 'finished') {
      navigate(`/host/${code}/results`);
    }
  }, [phase, navigate, code]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Загрузка вопроса...</p>
      </div>
    );
  }

  const imageUrl = currentQuestion.imagePath
    ? `/images/${currentQuestion.imagePath}`
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-900/80 backdrop-blur">
        <span className="text-sm text-gray-400">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentQuestion.questionNumber - 1
                    ? 'bg-purple-500'
                    : i === currentQuestion.questionNumber - 1
                      ? 'bg-white'
                      : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <span
            className={`text-lg font-bold tabular-nums ${
              timeLeft <= 10 ? 'text-red-400' : 'text-gray-300'
            }`}
          >
            {timeLeft}с
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">
        {imageUrl && (
          <div className="w-full max-w-2xl flex justify-center">
            <img
              src={imageUrl}
              alt="Вопрос"
              className="rounded-xl max-h-72 object-contain"
            />
          </div>
        )}

        <h2 className="text-2xl md:text-3xl font-medium text-center max-w-3xl leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-2 gap-3 w-full max-w-3xl mt-2">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-gray-800/60 border border-gray-700/50 rounded-xl px-5 py-4"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-300">
                {letters[index]}
              </span>
              <span className="text-base">{option}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
