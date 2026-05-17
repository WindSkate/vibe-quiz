import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Загрузка вопроса...</p>
      </div>
    );
  }

  const imageUrl = currentQuestion.imagePath
    ? `/images/${currentQuestion.imagePath}`
    : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <span className="text-lg font-medium">
          Вопрос {currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
        </span>
        <span
          className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}
        >
          {timeLeft}с
        </span>
      </div>

      <div className="w-full bg-gray-700 h-2">
        <div
          className="bg-purple-500 h-2 transition-all duration-1000"
          style={{ width: `${(timeLeft / currentQuestion.timeLeft) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold text-center mb-6 max-w-2xl">
          {currentQuestion.text}
        </h2>

        {imageUrl && (
          <div className="mb-6 max-w-md">
            <img
              src={imageUrl}
              alt="Вопрос"
              className="rounded-xl shadow-lg max-h-64 object-contain mx-auto"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {currentQuestion.options.map((option, index) => {
            const colors = [
              'bg-blue-600',
              'bg-red-600',
              'bg-green-600',
              'bg-yellow-600',
            ];
            return (
              <div
                key={index}
                className={`${colors[index]} rounded-xl p-6 text-center text-xl font-semibold`}
              >
                <span className="block text-sm opacity-75 mb-1">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
