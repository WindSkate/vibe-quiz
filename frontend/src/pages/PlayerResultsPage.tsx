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
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Результаты</h1>

        <div className="text-center mb-6">
          <p className="text-gray-400">
            {playerName}, ваше место:{' '}
            <span className="text-3xl font-bold text-purple-400">#{myRank}</span>
          </p>
          <p className="text-gray-500 mt-1">
            Баллов: <span className="font-semibold text-gray-300">{myScore}</span>
          </p>
        </div>

        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                result.name === playerName
                  ? 'bg-purple-500/10 border-purple-500/30'
                  : 'bg-gray-800/40 border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
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
                <span className="font-medium">{result.name}</span>
              </div>
              <span className="font-bold text-gray-300">{result.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleGoHome}
          className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
