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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-[5vw]">
        <div className="text-center">
          <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-white mb-[2vh]">Время вышло!</h2>
          <p className="text-gray-400 text-[clamp(1rem,2.5vw,1.5rem)]">Ждём следующий вопрос...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-[4vw] py-[2vh] bg-gray-900/80 backdrop-blur">
        <span className="text-[clamp(0.875rem,2vw,1.125rem)] text-gray-400">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <span
          className={`text-[clamp(1.25rem,3vw,1.75rem)] font-bold tabular-nums ${
            timeLeft <= 10 ? 'text-red-400' : 'text-gray-300'
          }`}
        >
          {timeLeft}с
        </span>
      </div>

      <div className="flex gap-[1vw] px-[4vw] py-[1.5vh] justify-center">
        {Array.from({ length: currentQuestion.totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={`w-[1.5vw] h-[1.5vw] min-w-[6px] min-h-[6px] rounded-full ${
              i < currentQuestion.questionNumber - 1
                ? 'bg-purple-500'
                : i === currentQuestion.questionNumber - 1
                  ? 'bg-white'
                  : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col px-[4vw] py-[2vh] gap-[2vh]">
        <h2 className="text-[clamp(1.125rem,3vw,1.75rem)] font-medium text-center leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="flex flex-col gap-[1.5vh] mt-[2vh]">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selected !== null}
              className={`flex items-center gap-[3vw] bg-gray-800/60 border border-gray-700/50 rounded-xl px-[4vw] py-[2.5vh] text-left transition-all duration-200 ${
                selected === option
                  ? 'border-purple-500 bg-purple-500/20 ring-1 ring-purple-500/50'
                  : selected !== null
                    ? 'opacity-40'
                    : 'active:bg-gray-700/60'
              }`}
            >
              <span className="flex-shrink-0 w-[clamp(2rem,5vw,2.5rem)] h-[clamp(2rem,5vw,2.5rem)] rounded-full bg-gray-700 flex items-center justify-center text-[clamp(0.875rem,2vw,1rem)] font-semibold text-gray-300">
                {letters[index]}
              </span>
              <span className="text-[clamp(1rem,2.5vw,1.25rem)]">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
