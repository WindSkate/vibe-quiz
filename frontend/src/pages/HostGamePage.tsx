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
    } else if (phase === 'answer_reveal') {
      navigate(`/host/${code}/answer-reveal`);
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
      <div className="flex justify-between items-center px-[3vw] py-[2vh] bg-gray-900/80 backdrop-blur">
        <span className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-400">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <div className="flex items-center gap-[1.5vw]">
          <div className="flex gap-[0.4vw]">
            {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-[0.8vw] h-[0.8vw] min-w-[8px] min-h-[8px] rounded-full ${
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
            className={`text-[clamp(1.25rem,2.5vw,2.5rem)] font-bold tabular-nums ${
              timeLeft <= 10 ? 'text-red-400' : 'text-gray-300'
            }`}
          >
            {timeLeft}с
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-[3vw] py-[3vh] gap-[3vh]">
        {imageUrl && (
          <div className="w-full flex justify-center" style={{ maxWidth: '80vw' }}>
            <img
              src={imageUrl}
              alt="Вопрос"
              className="rounded-xl object-contain"
              style={{ maxHeight: '40vh' }}
            />
          </div>
        )}

        <h2 className="text-[clamp(1.5rem,4vw,4rem)] font-medium text-center leading-snug" style={{ maxWidth: '85vw' }}>
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-2 gap-[1.5vw] w-full mt-[2vh]" style={{ maxWidth: '85vw' }}>
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-[1.5vw] bg-gray-800/60 border border-gray-700/50 rounded-xl px-[2vw] py-[2vh]"
            >
              <span className="flex-shrink-0 w-[clamp(2.5rem,4vw,4rem)] h-[clamp(2.5rem,4vw,4rem)] rounded-full bg-gray-700 flex items-center justify-center text-[clamp(1rem,2vw,1.5rem)] font-semibold text-gray-300">
                {letters[index]}
              </span>
              <span className="text-[clamp(1rem,2.5vw,2rem)]">{option}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
