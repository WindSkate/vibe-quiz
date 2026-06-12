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
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-[3vw]">
      <div className="w-full flex flex-col md:flex-row gap-[4vw] items-center md:items-start" style={{ maxWidth: '90vw' }}>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="bg-white p-[1.5vw] rounded-2xl">
            <QRCodeSVG value={joinUrl} size={Math.min(window.innerWidth * 0.2, 250)} />
          </div>
          <div className="mt-[3vh]">
            <h1 className="text-[clamp(0.75rem,1.2vw,1rem)] text-gray-400 mb-[1vh] text-center">Код лобби</h1>
            <div className="bg-gray-800 rounded-xl py-[2vh] px-[2vw] inline-block">
              <span className="text-5xl text-[clamp(2.5rem,5vw,4rem)] font-mono font-bold text-white tracking-widest">
                {code}
              </span>
            </div>
          </div>
          {lobbyTopicName && (
            <p className="text-gray-500 mt-[2vh] text-[clamp(0.875rem,1.5vw,1.25rem)] text-center">Тема: {lobbyTopicName}</p>
          )}
        </div>

        <div className="flex-1 w-full">
          <div className="mb-[4vh]">
            <h2 className="text-[clamp(0.875rem,1.5vw,1.25rem)] font-medium text-gray-400 mb-[1.5vh]">
              Игроки ({players.length})
            </h2>
            {players.length === 0 ? (
              <div className="text-center py-[6vh]">
                <p className="text-gray-600 text-[clamp(1rem,2vw,1.5rem)]">Ожидание игроков...</p>
              </div>
            ) : (
              <div className="space-y-[1vh] overflow-y-auto" style={{ maxHeight: '50vh' }}>
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-[1.5vw] px-[2vw] py-[1.5vh] bg-gray-800/60 border border-gray-700/50 rounded-xl"
                  >
                    <div className="w-[clamp(2.5rem,4vw,3.5rem)] h-[clamp(2.5rem,4vw,3.5rem)] bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-[clamp(1rem,2vw,1.5rem)]">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[clamp(1rem,2vw,1.5rem)]">{player.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-[1.5vh]">
            <button
              onClick={startGame}
              disabled={players.length === 0}
              className="w-full bg-purple-600 text-white py-[2vh] rounded-xl font-semibold text-[clamp(1rem,2vw,1.5rem)] hover:bg-purple-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Начать игру
            </button>
            <button
              onClick={() => {
                reset();
                navigate('/');
              }}
              className="w-full bg-gray-800 text-gray-400 py-[1.5vh] rounded-xl font-medium hover:bg-gray-700 transition-colors text-[clamp(0.875rem,1.5vw,1.25rem)]"
            >
              Отменить и вернуться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
