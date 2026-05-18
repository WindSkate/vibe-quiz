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
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Код лобби</h1>
          <div className="bg-purple-100 rounded-xl py-4 px-6 inline-block">
            <span className="text-5xl font-mono font-bold text-purple-700 tracking-widest animate-bounce-in">
              {code}
            </span>
          </div>
          {lobbyTopicName && (
            <p className="text-gray-500 mt-3">Тема: {lobbyTopicName}</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Игроки ({players.length})
          </h2>
          {players.length === 0 ? (
            <div className="text-center py-6">
              <div className="animate-pulse">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-gray-400">Ожидание игроков...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
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
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Начать игру
          </button>
          <button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
          >
            Отменить и вернуться
          </button>
        </div>
      </div>
    </div>
  );
}
