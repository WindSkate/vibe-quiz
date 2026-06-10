import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';
import { lobbyApi } from '../services/api';

export default function PlayerWaitingPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { playerName, phase, playerId } = usePlayerStore();
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    if (!playerId) {
      const savedSession = localStorage.getItem('quiz-player-session');
      if (savedSession && code) {
        try {
          const { lobbyCode, playerId: savedPlayerId, playerName } = JSON.parse(savedSession);
          if (lobbyCode === code && savedPlayerId && playerName) {
            usePlayerStore.getState().reconnectToLobby(lobbyCode, savedPlayerId, playerName)
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
    const fetchPlayers = async () => {
      if (!code) return;
      try {
        const res = await lobbyApi.getPlayers(code);
        setPlayerCount(res.data.length);
      } catch {
        // ignore
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (phase === 'answering') {
      navigate(`/player/${code}/answer`);
    } else if (phase === 'answer_reveal') {
      navigate(`/player/${code}/answer-reveal`);
    } else if (phase === 'results') {
      navigate(`/player/${code}/results`);
    }
  }, [phase, navigate, code]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="relative inline-block mb-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
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
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-950 animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Ждём начала игры...</h2>
        <p className="text-gray-400 mb-6">
          Привет, <span className="font-semibold text-purple-400">{playerName}</span>!
        </p>

        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 mb-6">
          <span className="text-gray-300">
            {playerCount} {playerCount === 1 ? 'игрок' : playerCount < 5 ? 'игрока' : 'игроков'} в лобби
          </span>
        </div>

        <p className="text-gray-600 text-sm">
          Хост скоро запустит игру. Не закрывайте эту страницу.
        </p>
      </div>
    </div>
  );
}
