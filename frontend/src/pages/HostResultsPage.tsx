import { useNavigate } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

export default function HostResultsPage() {
  const navigate = useNavigate();
  const { results } = useHostStore();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'rank-badge-gold';
      case 2: return 'rank-badge-silver';
      case 3: return 'rank-badge-bronze';
      default: return 'rank-badge-default';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  return (
    <div className="min-h-screen bg-surface text-white flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-600/15 via-transparent to-transparent" />
      
      <div className="w-full max-w-3xl relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-6 shadow-glow">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-5xl font-bold font-display text-gradient-primary">Результаты</h1>
        </div>

        <div className="space-y-3 mb-10">
          {results.map((result, index) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between px-6 py-5 rounded-3xl border-2 transition-all animate-slide-up ${
                result.rank === 1
                  ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30 shadow-lg'
                  : result.rank === 2
                    ? 'bg-white/5 border-gray-400/20'
                    : result.rank === 3
                      ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20'
                      : 'bg-white/5 border-white/5'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-5">
                <div className={getRankBadge(result.rank)}>
                  {getRankEmoji(result.rank)}
                </div>
                <span className="text-2xl font-medium text-gray-100">{result.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-400 font-display">{result.score}</span>
                <span className="text-gray-500 text-sm">баллов</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-primary w-full text-xl py-5"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            На главную
          </span>
        </button>
      </div>
    </div>
  );
}
