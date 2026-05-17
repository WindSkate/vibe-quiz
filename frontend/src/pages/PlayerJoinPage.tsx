import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

export default function PlayerJoinPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { error, joinLobby, setError } = usePlayerStore();

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Викторина</h1>
        <p className="text-center text-gray-500 mb-8">Введите код лобби и ваше имя</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Код лобби
            </label>
            <input
              id="code"
              type="text"
              maxLength={3}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ваше имя
            </label>
            <input
              id="name"
              type="text"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Игрок"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              autoComplete="off"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !code || !name.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Подключение...' : 'Подключиться'}
          </button>
        </form>
      </div>
    </div>
  );
}
