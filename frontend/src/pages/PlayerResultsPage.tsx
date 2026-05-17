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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Результаты</h1>

        <div className="text-center mb-6">
          <p className="text-gray-500">
            {playerName}, ваше место:{' '}
            <span className="text-3xl font-bold text-purple-600">#{myRank}</span>
          </p>
          <p className="text-gray-400">
            Баллов: <span className="font-semibold">{myScore}</span>
          </p>
        </div>

        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                result.name === playerName
                  ? 'bg-purple-100 border-2 border-purple-300'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    result.rank === 1
                      ? 'bg-yellow-400 text-yellow-900'
                      : result.rank === 2
                        ? 'bg-gray-300 text-gray-700'
                        : result.rank === 3
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {result.rank}
                </span>
                <span className="font-medium">{result.name}</span>
              </div>
              <span className="font-bold text-gray-700">{result.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleGoHome}
          className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
