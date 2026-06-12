import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

const letters = ['A', 'B', 'C', 'D'];

export default function PlayerAnswerPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentQuestion, submitAnswer, phase, playerId } = usePlayerStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!playerId) {
      const savedSession = localStorage.getItem('quiz-player-session');
      if (savedSession && code) {
        try {
          const { lobbyCode, playerId: savedPlayerId, playerName } = JSON.parse(savedSession);
          if (lobbyCode === code && savedPlayerId && playerName) {
            usePlayerStore.getState().reconnectToLobby(lobbyCode, savedPlayerId, playerName)
              .then(() => {
                navigate(`/player/${lobbyCode}/waiting`);
              })
              .catch(() => {
                localStorage.removeItem('quiz-player-session');
                window.location.href = `/player/join?code=${code}`;
              });
            return;
          }
        } catch {
          localStorage.removeItem('quiz-player-session');
        }
      }
      window.location.href = `/player/join?code=${code}`;
      return;
    }
    if (phase === 'results') {
      navigate(`/player/${code}/results`);
      return;
    }
    if (phase === 'answer_reveal') {
      navigate(`/player/${code}/answer-reveal`);
      return;
    }
  }, [phase, navigate, code, playerId]);

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

  if (phase === 'timeout') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center animate-bounce-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-red/20 border-2 border-accent-red mb-6">
            <svg className="w-10 h-10 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-display">Время вышло!</h2>
          <p className="text-gray-400">Ждём следующий вопрос...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const progressPercent = (timeLeft / 30) * 100;

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-5 py-4 bg-white/5 backdrop-blur-lg border-b border-white/5">
        <span className="text-sm text-gray-400 font-medium">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold tabular-nums font-mono transition-colors duration-300 ${
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

      <div className="flex gap-1.5 px-5 py-3 justify-center">
        {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i < currentQuestion.questionNumber - 1
                ? 'bg-primary-500'
                : i === currentQuestion.questionNumber - 1
                  ? 'bg-white shadow-glow-sm'
                  : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col px-5 py-4 gap-4 question-enter">
        <h2 className="text-lg font-medium text-center leading-relaxed text-gray-100">
          {currentQuestion.text}
        </h2>

        <div className="flex flex-col gap-3 mt-auto">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selected !== null}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-200 ${
                selected === option
                  ? 'border-2 border-primary-500 bg-primary-500/20 ring-1 ring-primary-500/50 scale-[1.02]'
                  : selected !== null
                    ? 'border-2 border-white/5 bg-white/5 opacity-40'
                    : 'border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-[0.98]'
              }`}
            >
              <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                selected === option
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-gray-300'
              }`}>
                {letters[index]}
              </span>
              <span className="text-base font-medium">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
