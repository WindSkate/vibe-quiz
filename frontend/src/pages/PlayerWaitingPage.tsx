import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

export default function PlayerWaitingPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { playerName, phase, disconnectFromGame } = usePlayerStore();

  useEffect(() => {
    if (phase === 'answering') {
      navigate(`/player/${code}/answer`);
    } else if (phase === 'results') {
      navigate(`/player/${code}/results`);
    }
  }, [phase, navigate, code]);

  useEffect(() => {
    return () => {
      disconnectFromGame();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ждём начала игры...</h2>
        <p className="text-gray-500 mb-4">
          Привет, <span className="font-semibold text-purple-600">{playerName}</span>!
        </p>
        <p className="text-gray-400 text-sm">
          Хост скоро запустит игру. Не закрывайте эту страницу.
        </p>
      </div>
    </div>
  );
}
