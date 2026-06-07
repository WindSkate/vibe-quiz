import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHostStore } from '../stores/hostStore';

export default function HostLobbyPage() {
  const navigate = useNavigate();
  const { topics, loadTopics, createLobby, error } = useHostStore();
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const handleCreate = async () => {
    if (!selectedTopic) return;

    setLoading(true);
    try {
      const code = await createLobby(selectedTopic);
      navigate(`/host/${code}/waiting`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2">Создать лобби</h1>
        <p className="text-center text-gray-500 mb-8">Выберите тему для викторины</p>

        {topics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Нет доступных тем</p>
            <button
              onClick={() => navigate('/editor')}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Создать тему
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTopic === topic.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-semibold">{topic.name}</h3>
                  {topic.description && (
                    <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                  )}
                </button>
              ))}
            </div>
            <p className="text-center mb-4">
              <button
                onClick={() => navigate('/editor')}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                Управление темами →
              </button>
            </p>
          </>
        )}

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={!selectedTopic || loading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {loading ? 'Создание...' : 'Создать лобби'}
        </button>

        <div className="mt-4 pt-4 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm mb-2">Хотите присоединиться к игре?</p>
          <button
            onClick={() => navigate('/player/join')}
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Подключиться к лобби →
          </button>
        </div>
      </div>
    </div>
  );
}
