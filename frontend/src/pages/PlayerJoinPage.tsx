import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

export default function PlayerJoinPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const isValidCode = !!(codeFromUrl && /^\d{3}$/.test(codeFromUrl));
  
  const [code, setCode] = useState(isValidCode ? codeFromUrl : '');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { error, joinLobby, reconnectToLobby, setError } = usePlayerStore();

  useEffect(() => {
    if (isValidCode && codeFromUrl) {
      setCode(codeFromUrl);
      
      const savedSession = localStorage.getItem('quiz-player-session');
      if (savedSession) {
        try {
          const { lobbyCode, playerId, playerName } = JSON.parse(savedSession);
          if (lobbyCode === codeFromUrl && playerId && playerName) {
            reconnectToLobby(lobbyCode, playerId, playerName)
              .then(() => {
                navigate(`/player/${lobbyCode}/waiting`);
              })
              .catch(() => {
                localStorage.removeItem('quiz-player-session');
              });
          }
        } catch {
          localStorage.removeItem('quiz-player-session');
        }
      }
    }
  }, [codeFromUrl, isValidCode, reconnectToLobby, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code || !name.trim()) return;

    setLoading(true);
    try {
      await joinLobby(code, name.trim());
      navigate(`/player/${code}/waiting`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-600/20 via-transparent to-transparent opacity-50" />
      
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-display">Викторина</h1>
          <p className="text-gray-400 mt-2">Введите код лобби и ваше имя</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Код лобби
            </label>
            <input
              id="code"
              type="text"
              maxLength={3}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              readOnly={isValidCode}
              className={`input-field text-center text-2xl font-mono tracking-[0.5em] ${isValidCode ? 'opacity-75 cursor-not-allowed' : ''}`}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Ваше имя
            </label>
            <input
              id="name"
              type="text"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Игрок"
              className="input-field"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-accent-red text-sm bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code || !name.trim()}
            className="btn-primary w-full text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Подключение...
              </span>
            ) : (
              'Подключиться'
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Хост создал лобби? Введите код выше
        </p>
      </div>
    </div>
  );
}
