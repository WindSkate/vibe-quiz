import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useHostStore } from '../stores/hostStore';

export default function HostWaitingPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { lobbyTopicName, players, phase, startGame, reset } = useHostStore();

  const joinUrl = `${window.location.origin}/player/join?code=${code}`;

  useEffect(() => {
    if (phase === 'playing') {
      navigate(`/host/${code}/game`);
    } else if (phase === 'finished') {
      navigate(`/host/${code}/results`);
    }
  }, [phase, navigate, code]);

  return (
    <div className="min-h-screen bg-surface text-white flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-600/10 via-transparent to-transparent" />
      
      <div className="w-full max-w-5xl relative z-10 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="bg-white p-6 rounded-3xl shadow-glow mb-6">
              <QRCodeSVG value={joinUrl} size={Math.min(window.innerWidth * 0.18, 220)} />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Код лобби</p>
              <div className="glass-card px-8 py-4 inline-block">
                <span className="text-5xl font-mono font-bold tracking-[0.3em] text-gradient-primary">
                  {code}
                </span>
              </div>
            </div>
            
            {lobbyTopicName && (
              <div className="mt-4 flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-sm">{lobbyTopicName}</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Игроки
                </h2>
                <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                  {players.length}
                </span>
              </div>
              
              {players.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Ожидание игроков...</p>
                  <p className="text-gray-600 text-sm mt-1">Поделитесь кодом или QR-кодом</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 player-enter"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-200">{player.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className="btn-primary w-full text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Начать игру
                </span>
              </button>
              <button
                onClick={() => {
                  reset();
                  navigate('/');
                }}
                className="btn-secondary w-full"
              >
                Отменить и вернуться
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
