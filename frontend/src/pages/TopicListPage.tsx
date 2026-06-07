import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicApi } from '../services/api';
import { Topic } from '../types';

export default function TopicListPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const loadTopics = async () => {
    try {
      const response = await topicApi.getAll();
      setTopics(response.data);
    } catch {
      console.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      await topicApi.create({ name: newName.trim(), description: newDescription.trim() || undefined });
      setShowCreate(false);
      setNewName('');
      setNewDescription('');
      loadTopics();
    } catch {
      console.error('Failed to create topic');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить тему и все её вопросы?')) return;

    try {
      await topicApi.delete(id);
      loadTopics();
    } catch {
      console.error('Failed to delete topic');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Редактор тем</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Создать тему
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {showCreate && (
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Новая тема</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Название</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Например: География"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Описание</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Краткое описание темы"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-600"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600 py-8">Загрузка...</p>
        ) : topics.length === 0 ? (
          <p className="text-center text-gray-600 py-8">Нет тем. Создайте первую!</p>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/editor/${topic.id}`)}
                >
                  <h3 className="font-semibold">{topic.name}</h3>
                  {topic.description && (
                    <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Удалить"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-6 text-purple-400 hover:text-purple-300 font-medium"
        >
          ← На главную
        </button>
      </main>
    </div>
  );
}
