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
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Викторина</h1>
        <p className="text-center text-gray-500 mb-8">Введите код лобби и ваше имя</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-1">
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
              className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl font-mono tracking-widest text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${isValidCode ? 'opacity-75 cursor-not-allowed' : ''}`}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
              Ваше имя
            </label>
            <input
              id="name"
              type="text"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Игрок"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              autoComplete="off"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !code || !name.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Подключение...' : 'Подключиться'}
          </button>
        </form>
      </div>
    </div>
  );
}
