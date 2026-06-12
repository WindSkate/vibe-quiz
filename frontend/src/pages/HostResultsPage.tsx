import { useNavigate } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

export default function HostResultsPage() {
  const navigate = useNavigate();
  const { results } = useHostStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-[3vw]">
      <div className="w-full" style={{ maxWidth: '80vw' }}>
        <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold text-center mb-[4vh]">Результаты</h1>

        <div className="space-y-[1.5vh]">
          {results.map((result) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between px-[3vw] py-[2vh] rounded-xl border ${
                result.rank === 1
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : result.rank === 2
                    ? 'bg-gray-800/60 border-gray-700/50'
                    : result.rank === 3
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-gray-800/40 border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-[2vw]">
                <span
                  className={`w-[clamp(3rem,5vw,4.5rem)] h-[clamp(3rem,5vw,4.5rem)] rounded-full flex items-center justify-center font-bold text-[clamp(1.25rem,2.5vw,2rem)] ${
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
                <span className="text-[clamp(1.25rem,2.5vw,2.5rem)] font-medium">{result.name}</span>
              </div>
              <span className="text-[clamp(1.5rem,3vw,3rem)] font-bold text-purple-400">{result.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-[4vh] bg-purple-600 text-white py-[2vh] rounded-xl font-semibold text-[clamp(1rem,2vw,1.5rem)] hover:bg-purple-700 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
