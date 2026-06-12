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
      <div className="flex justify-between items-center px-[3vw] py-[2vh] bg-gray-900/80 backdrop-blur">
        <span className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-400">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <span className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-400">Результаты ответа</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-[3vw] py-[3vh] gap-[2vh]">
        {imageUrl && (
          <div className="w-full flex justify-center" style={{ maxWidth: '70vw' }}>
            <img
              src={imageUrl}
              alt="Вопрос"
              className="rounded-xl object-contain"
              style={{ maxHeight: '30vh' }}
            />
          </div>
        )}

        <h2 className="text-[clamp(1.25rem,3vw,3rem)] font-medium text-center leading-snug" style={{ maxWidth: '85vw' }}>
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-2 gap-[1.5vw] w-full mt-[2vh]" style={{ maxWidth: '85vw' }}>
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === correctAnswer;
            const playerNames = getPlayerNamesForAnswer(option);

            return (
              <div
                key={index}
                className={`flex flex-col gap-[1vh] rounded-xl px-[2vw] py-[2vh] border-2 transition-all ${
                  isCorrect
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-gray-700/50 bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-[1.5vw]">
                  <span className={`flex-shrink-0 w-[clamp(2.5rem,4vw,4rem)] h-[clamp(2.5rem,4vw,4rem)] rounded-full flex items-center justify-center text-[clamp(1rem,2vw,1.5rem)] font-semibold ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {letters[index]}
                  </span>
                  <span className="text-[clamp(1rem,2.5vw,2rem)]">{option}</span>
                  {isCorrect && (
                    <span className="ml-auto text-green-400 text-[clamp(1.5rem,3vw,2.5rem)]">✓</span>
                  )}
                </div>
                {playerNames.length > 0 && (
                  <div className="flex flex-wrap gap-[0.5vw] ml-[5vw]">
                    {playerNames.map((name, i) => (
                      <span
                        key={i}
                        className="text-[clamp(0.75rem,1.2vw,1rem)] bg-gray-700/80 text-gray-300 px-[1vw] py-[0.5vh] rounded-full"
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
          className="mt-[3vh] bg-purple-600 text-white px-[4vw] py-[2vh] rounded-xl hover:bg-purple-700 transition-colors font-semibold text-[clamp(1.25rem,2.5vw,2rem)]"
        >
          Следующий вопрос →
        </button>
      </div>
    </div>
  );
}
