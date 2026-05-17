import { useNavigate } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

export default function HostResultsPage() {
  const navigate = useNavigate();
  const { results } = useHostStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Результаты</h1>

        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between p-4 rounded-xl ${
                result.rank === 1
                  ? 'bg-yellow-50 border-2 border-yellow-300'
                  : result.rank === 2
                    ? 'bg-gray-50 border-2 border-gray-300'
                    : result.rank === 3
                      ? 'bg-orange-50 border-2 border-orange-300'
                      : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
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
                <span className="text-lg font-semibold">{result.name}</span>
              </div>
              <span className="text-xl font-bold text-purple-600">{result.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
