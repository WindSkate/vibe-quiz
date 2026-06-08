import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

const letters = ['A', 'B', 'C', 'D'];

export default function PlayerAnswerRevealPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentQuestion, correctAnswer, playerAnswers, playerId, phase, sendNextQuestion } = usePlayerStore();

  useEffect(() => {
    if (phase === 'results') {
      navigate(`/player/${code}/results`);
    } else if (phase === 'answering') {
      navigate(`/player/${code}/answer`);
    }
  }, [phase, navigate, code]);

  if (!currentQuestion || !correctAnswer) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white text-xl">Загрузка...</p>
        </div>
      </div>
    );
  }

  const myAnswer = playerId ? playerAnswers[playerId] : null;
  const isCorrect = myAnswer === correctAnswer;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-900/80 backdrop-blur">
        <span className="text-sm text-gray-400">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <span className="text-sm text-gray-400">Результат</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4">
        <div className={`text-center py-4 px-6 rounded-2xl ${
          isCorrect
            ? 'bg-green-500/20 border-2 border-green-500'
            : 'bg-red-500/20 border-2 border-red-500'
        }`}>
          <span className="text-4xl">{isCorrect ? '✓' : '✗'}</span>
          <p className={`text-xl font-bold mt-2 ${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            {isCorrect ? 'Правильно!' : 'Неправильно'}
          </p>
        </div>

        <div className="w-full max-w-md space-y-2 mt-4">
          {currentQuestion.options.map((option, index) => {
            const isCorrectOption = option === correctAnswer;
            const isMyAnswer = option === myAnswer;

            let borderColor = 'border-gray-700/50';
            let bgColor = 'bg-gray-800/60';

            if (isCorrectOption) {
              borderColor = 'border-green-500';
              bgColor = 'bg-green-500/20';
            } else if (isMyAnswer && !isCorrect) {
              borderColor = 'border-red-500';
              bgColor = 'bg-red-500/20';
            }

            return (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 border-2 ${borderColor} ${bgColor}`}
              >
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isCorrectOption
                    ? 'bg-green-500 text-white'
                    : isMyAnswer && !isCorrect
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                }`}>
                  {letters[index]}
                </span>
                <span className="text-base">{option}</span>
                {isCorrectOption && (
                  <span className="ml-auto text-green-400">✓</span>
                )}
                {isMyAnswer && !isCorrect && (
                  <span className="ml-auto text-red-400">✗</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={sendNextQuestion}
          className="mt-4 bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg w-full max-w-md"
        >
          Продолжить →
        </button>
      </div>
    </div>
  );
}
