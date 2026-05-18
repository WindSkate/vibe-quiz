import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';
import { lobbyApi } from '../services/api';

export default function PlayerWaitingPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { playerName, phase, disconnectFromGame } = usePlayerStore();
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
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
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center animate-fade-in">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-purple-600"
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
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ждём начала игры...</h2>
        <p className="text-gray-500 mb-4">
          Привет, <span className="font-semibold text-purple-600">{playerName}</span>!
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="font-medium">
              {playerCount} {playerCount === 1 ? 'игрок' : playerCount < 5 ? 'игрока' : 'игроков'} в лобби
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          Хост скоро запустит игру. Не закрывайте эту страницу.
        </p>
      </div>
    </div>
  );
}
