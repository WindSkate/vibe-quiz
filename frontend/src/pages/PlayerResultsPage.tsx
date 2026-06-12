import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

export default function PlayerResultsPage() {
  const navigate = useNavigate();
  const { results, myRank, myScore, playerName, disconnectFromGame } = usePlayerStore();

  const handleGoHome = () => {
    disconnectFromGame();
    navigate('/');
  };

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
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-surface text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-600/10 via-transparent to-transparent" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-display mb-4">Результаты</h1>
          
          <div className="glass-card p-6 mb-6">
            <p className="text-gray-400 text-sm mb-2">{playerName}</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-gradient-primary font-display">#{myRank}</p>
                <p className="text-gray-500 text-xs mt-1">Место</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-4xl font-bold text-white font-display">{myScore}</p>
                <p className="text-gray-500 text-xs mt-1">Баллов</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {results.map((result) => (
            <div
              key={result.rank}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${
                result.name === playerName
                  ? 'bg-primary-500/10 border-primary-500/30'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={getRankBadge(result.rank)}>
                  {result.rank <= 3 ? getRankEmoji(result.rank) : result.rank}
                </div>
                <span className={`font-medium ${result.name === playerName ? 'text-primary-300' : 'text-gray-200'}`}>
                  {result.name}
                  {result.name === playerName && <span className="text-xs text-primary-400 ml-2">(вы)</span>}
                </span>
              </div>
              <span className="font-bold text-lg text-gray-300">{result.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleGoHome}
          className="btn-primary w-full text-lg"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
