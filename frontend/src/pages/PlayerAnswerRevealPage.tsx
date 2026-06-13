import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

const letters = ['A', 'B', 'C', 'D'];
const ANSWER_REVEAL_TIME = 60;

export default function PlayerAnswerRevealPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { currentQuestion, correctAnswer, playerAnswers, playerId, phase, sendNextQuestion } = usePlayerStore();
  const [timeLeft, setTimeLeft] = useState(ANSWER_REVEAL_TIME);

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
    } else if (phase === 'answering') {
      navigate(`/player/${code}/answer`);
    }
  }, [phase, navigate, code, playerId]);

  useEffect(() => {
    setTimeLeft(ANSWER_REVEAL_TIME);
  }, [currentQuestion]);

  useEffect(() => {
    if (!currentQuestion || !correctAnswer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sendNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, correctAnswer, sendNextQuestion]);

  if (!currentQuestion || !correctAnswer) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white text-xl">Загрузка...</p>
        </div>
      </div>
    );
  }

  const myAnswer = playerId ? playerAnswers[playerId] : null;
  const isCorrect = myAnswer === correctAnswer;

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-5 py-4 bg-white/5 backdrop-blur-lg border-b border-white/5">
        <span className="text-sm text-gray-400 font-medium">
          {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
        </span>
        <span className={`text-lg font-bold tabular-nums font-mono ${
          timeLeft <= 10 ? 'text-accent-red' : 'text-gray-400'
        }`}>
          {timeLeft}с
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 py-6 gap-6 animate-fade-in">
        <div className="w-full space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isCorrectOption = option === correctAnswer;
            const isMyAnswer = option === myAnswer;

            let borderClass = 'border-white/10';
            let bgClass = 'bg-white/5';
            let letterClass = 'bg-white/10 text-gray-300';

            if (isCorrectOption) {
              borderClass = 'border-accent-green/50';
              bgClass = 'bg-accent-green/10';
              letterClass = 'bg-accent-green text-white';
            } else if (isMyAnswer && !isCorrect) {
              borderClass = 'border-accent-red/50';
              bgClass = 'bg-accent-red/10';
              letterClass = 'bg-accent-red text-white';
            }

            return (
              <div
                key={index}
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 border-2 ${borderClass} ${bgClass} transition-all duration-300`}
              >
                <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${letterClass}`}>
                  {letters[index]}
                </span>
                <span className="text-base font-medium flex-1">{option}</span>
                {isCorrectOption && (
                  <span className="text-accent-green text-xl">✓</span>
                )}
                {isMyAnswer && !isCorrect && (
                  <span className="text-accent-red text-xl">✗</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={sendNextQuestion}
          className="btn-primary w-full text-lg mt-4"
        >
          Продолжить →
        </button>
      </div>
    </div>
  );
}
