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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xl">Загрузка вопроса...</span>
        </div>
      </div>
    );
  }

  const imageUrl = currentQuestion.imagePath
    ? `/images/${currentQuestion.imagePath}`
    : null;

  const progressPercent = (timeLeft / 30) * 100;

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col">
      <div className="flex justify-between items-center px-8 py-4 bg-white/5 backdrop-blur-lg border-b border-white/5">
        <span className="text-lg text-gray-400 font-medium">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i < currentQuestion.questionNumber - 1
                    ? 'bg-primary-500'
                    : i === currentQuestion.questionNumber - 1
                      ? 'bg-white shadow-glow-sm'
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <div className={`text-3xl font-bold tabular-nums font-mono transition-colors duration-300 ${
            timeLeft <= 10 ? 'text-accent-red animate-pulse' : 'text-white'
          }`}>
            {timeLeft}
          </div>
        </div>
      </div>

      <div className="h-1 bg-white/5">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timeLeft <= 10 ? 'bg-accent-red' : 'bg-gradient-primary'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 gap-8 question-enter">
        {imageUrl && (
          <div className="w-full flex justify-center" style={{ maxWidth: '75vw' }}>
            <img
              src={imageUrl}
              alt="Вопрос"
              className="rounded-3xl object-contain shadow-2xl border border-white/10"
              style={{ maxHeight: '35vh' }}
            />
          </div>
        )}

        <h2 className="text-[clamp(1.5rem,3.5vw,3.5rem)] font-medium text-center leading-snug font-display" style={{ maxWidth: '85vw' }}>
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-2 gap-4 w-full mt-4" style={{ maxWidth: '85vw' }}>
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-5 bg-white/5 border border-white/10 rounded-3xl px-6 py-5 transition-all duration-200 hover:bg-white/10"
            >
              <span className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/30 to-primary-600/30 border border-primary-500/20 flex items-center justify-center text-xl font-bold text-primary-300">
                {letters[index]}
              </span>
              <span className="text-[clamp(1rem,2vw,1.75rem)] text-gray-200">{option}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
