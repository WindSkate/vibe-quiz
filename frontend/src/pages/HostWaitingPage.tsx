import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

export default function HostWaitingPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { lobbyTopicName, players, phase, startGame, reset } = useHostStore();

  useEffect(() => {
    if (phase === 'playing') {
      navigate(`/host/${code}/game`);
    } else if (phase === 'finished') {
      navigate(`/host/${code}/results`);
    }
  }, [phase, navigate, code]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-sm text-gray-400 mb-2">Код лобби</h1>
          <div className="bg-gray-800 rounded-xl py-6 px-8 inline-block">
            <span className="text-5xl font-mono font-bold text-white tracking-widest">
              {code}
            </span>
          </div>
          {lobbyTopicName && (
            <p className="text-gray-500 mt-3">Тема: {lobbyTopicName}</p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            Игроки ({players.length})
          </h2>
          {players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Ожидание игроков...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={startGame}
            disabled={players.length === 0}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Начать игру
          </button>
          <button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="w-full bg-gray-800 text-gray-400 py-2 rounded-xl font-medium hover:bg-gray-700 transition-colors text-sm"
          >
            Отменить и вернуться
          </button>
        </div>
      </div>
    </div>
  );
}
