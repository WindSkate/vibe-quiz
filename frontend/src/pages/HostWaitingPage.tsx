import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

export default function HostWaitingPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { lobbyTopicName, players, phase, startGame } = useHostStore();

  useEffect(() => {
    if (phase === 'playing') {
      navigate(`/host/${code}/game`);
    } else if (phase === 'finished') {
      navigate(`/host/${code}/results`);
    }
  }, [phase, navigate, code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Код лобби</h1>
          <div className="bg-purple-100 rounded-xl py-4 px-6 inline-block">
            <span className="text-5xl font-mono font-bold text-purple-700 tracking-widest">
              {code}
            </span>
          </div>
          {lobbyTopicName && (
            <p className="text-gray-500 mt-3">Тема: {lobbyTopicName}</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Игроки ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Ожидание игроков...</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={startGame}
          disabled={players.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Начать игру
        </button>
      </div>
    </div>
  );
}
