import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

const letters = ['A', 'B', 'C', 'D'];

export default function HostAnswerRevealPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentQuestion, correctAnswer, playerAnswers, players, phase, sendNextQuestion } = useHostStore();

  useEffect(() => {
    if (phase === 'finished') {
      navigate(`/host/${code}/results`);
    } else if (phase === 'playing') {
      navigate(`/host/${code}/game`);
    }
  }, [phase, navigate, code]);

  if (!currentQuestion || !correctAnswer) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Загрузка...</p>
      </div>
    );
  }

  const imageUrl = currentQuestion.imagePath
    ? `/images/${currentQuestion.imagePath}`
    : null;

  const getPlayerNamesForAnswer = (answer: string): string[] => {
    return Object.entries(playerAnswers)
      .filter(([, a]) => a === answer)
      .map(([id]) => {
        const player = players.find((p) => p.id === id);
        return player?.name ?? 'Неизвестный';
      });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-900/80 backdrop-blur">
        <span className="text-sm text-gray-400">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <span className="text-sm text-gray-400">Результаты ответа</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-4">
        {imageUrl && (
          <div className="w-full max-w-2xl flex justify-center">
            <img
              src={imageUrl}
              alt="Вопрос"
              className="rounded-xl max-h-48 object-contain"
            />
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-medium text-center max-w-3xl leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-2 gap-3 w-full max-w-3xl mt-2">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === correctAnswer;
            const playerNames = getPlayerNamesForAnswer(option);

            return (
              <div
                key={index}
                className={`flex flex-col gap-2 rounded-xl px-5 py-4 border-2 transition-all ${
                  isCorrect
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-700/50 bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {letters[index]}
                  </span>
                  <span className="text-base">{option}</span>
                  {isCorrect && (
                    <span className="ml-auto text-green-400 text-lg">✓</span>
                  )}
                </div>
                {playerNames.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-11">
                    {playerNames.map((name, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-700/80 text-gray-300 px-2 py-0.5 rounded-full"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={sendNextQuestion}
          className="mt-4 bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg"
        >
          Следующий вопрос →
        </button>
      </div>
    </div>
  );
}
