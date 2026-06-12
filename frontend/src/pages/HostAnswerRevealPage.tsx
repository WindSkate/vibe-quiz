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
      <div className="min-h-screen bg-surface flex items-center justify-center">
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
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <div className="flex justify-between items-center px-8 py-4 bg-white/5 backdrop-blur-lg border-b border-white/5">
        <span className="text-lg text-gray-400 font-medium">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <span className="text-lg text-gray-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Результаты ответа
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 gap-6 animate-fade-in">
        {imageUrl && (
          <div className="w-full flex justify-center" style={{ maxWidth: '65vw' }}>
            <img
              src={imageUrl}
              alt="Вопрос"
              className="rounded-3xl object-contain shadow-xl border border-white/10"
              style={{ maxHeight: '25vh' }}
            />
          </div>
        )}

        <h2 className="text-[clamp(1.25rem,2.5vw,2.5rem)] font-medium text-center leading-snug font-display" style={{ maxWidth: '85vw' }}>
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-2 gap-4 w-full mt-4" style={{ maxWidth: '85vw' }}>
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === correctAnswer;
            const playerNames = getPlayerNamesForAnswer(option);

            return (
              <div
                key={index}
                className={`flex flex-col gap-3 rounded-3xl px-6 py-5 border-2 transition-all ${
                  isCorrect
                    ? 'border-accent-green/50 bg-accent-green/10 shadow-glow-green'
                    : 'border-white/5 bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${
                    isCorrect
                      ? 'bg-accent-green text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}>
                    {letters[index]}
                  </span>
                  <span className="text-[clamp(1rem,2vw,1.5rem)] text-gray-200 flex-1">{option}</span>
                  {isCorrect && (
                    <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                      <span className="text-accent-green text-2xl">✓</span>
                    </div>
                  )}
                </div>
                {playerNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-16">
                    {playerNames.map((name, i) => (
                      <span
                        key={i}
                        className={`text-sm px-3 py-1 rounded-full ${
                          isCorrect
                            ? 'bg-accent-green/20 text-accent-green'
                            : 'bg-white/5 text-gray-400'
                        }`}
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
          className="btn-primary text-xl px-10 py-4 mt-6"
        >
          <span className="flex items-center gap-2">
            Следующий вопрос
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
