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
    <div className="min-h-screen bg-surface text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-600/10 via-transparent to-transparent" />
      
      <div className="w-full max-w-sm text-center relative z-10 animate-fade-in">
        <div className="relative inline-block mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-green rounded-full border-4 border-surface animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold font-display mb-2">Ждём начала игры...</h2>
        <p className="text-gray-400 mb-8">
          Привет, <span className="font-semibold text-primary-400">{playerName}</span>!
        </p>

        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(playerCount, 4) }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-surface flex items-center justify-center text-xs font-bold"
                >
                  {i + 1}
                </div>
              ))}
              {playerCount > 4 && (
                <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-surface flex items-center justify-center text-xs font-medium text-gray-400">
                  +{playerCount - 4}
                </div>
              )}
            </div>
            <span className="text-gray-300">
              {playerCount} {playerCount === 1 ? 'игрок' : playerCount < 5 ? 'игрока' : 'игроков'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          Хост скоро запустит игру
        </div>
      </div>
    </div>
  );
}
