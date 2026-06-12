import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

export default function PlayerResultsPage() {
  const navigate = useNavigate();
  const { results, myRank, myScore, playerName, disconnectFromGame } = usePlayerStore();

  const handleGoHome = () => {
    disconnectFromGame();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-[5vw]">
      <div className="w-full" style={{ maxWidth: '90vw' }}>
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-bold text-center mb-[3vh]">Результаты</h1>

        <div className="text-center mb-[3vh]">
          <p className="text-gray-400 text-[clamp(0.875rem,2vw,1rem)]">
            {playerName}, ваше место:{' '}
            <span className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-purple-400">#{myRank}</span>
          </p>
          <p className="text-gray-500 mt-[1vh] text-[clamp(0.875rem,2vw,1rem)]">
            Баллов: <span className="font-semibold text-gray-300">{myScore}</span>
          </p>
        </div>

        <div className="space-y-[1vh]">
          {results.map((result) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between px-[4vw] py-[2vh] rounded-xl border ${
                result.name === playerName
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-gray-800/40 border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-[2vw]">
                <span
                  className={`w-[clamp(2rem,5vw,2.5rem)] h-[clamp(2rem,5vw,2.5rem)] rounded-full flex items-center justify-center font-bold text-[clamp(0.75rem,2vw,0.875rem)] ${
                    result.rank === 1
                      ? 'bg-yellow-500 text-gray-900'
                      : result.rank === 2
                        ? 'bg-gray-600 text-white'
                        : result.rank === 3
                          ? 'bg-orange-500 text-gray-900'
                          : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {result.rank}
                </span>
                <span className="font-medium text-[clamp(0.875rem,2vw,1rem)]">{result.name}</span>
              </div>
              <span className="font-bold text-gray-300 text-[clamp(0.875rem,2vw,1rem)]">{result.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleGoHome}
          className="w-full mt-[3vh] bg-purple-600 text-white py-[2vh] rounded-xl font-semibold text-[clamp(1rem,2.5vw,1.25rem)] hover:bg-purple-700 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
