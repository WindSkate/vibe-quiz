import { useNavigate } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

export default function HostResultsPage() {
  const navigate = useNavigate();
  const { results } = useHostStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Результаты</h1>

        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between px-5 py-4 rounded-xl border ${
                result.rank === 1
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : result.rank === 2
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : result.rank === 3
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-gray-800/40 border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
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
                <span className="text-lg font-medium">{result.name}</span>
              </div>
              <span className="text-xl font-bold text-purple-400">{result.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-8 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
