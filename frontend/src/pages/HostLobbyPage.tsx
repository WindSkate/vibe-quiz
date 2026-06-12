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
    <div className="min-h-screen bg-surface text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary-600/15 via-transparent to-transparent" />
      
      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-display">Создать лобби</h1>
          <p className="text-gray-400 mt-2">Выберите тему для викторины</p>
        </div>

        {topics.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-400 mb-6">Нет доступных тем</p>
            <button
              onClick={() => navigate('/editor')}
              className="btn-primary"
            >
              Создать тему
            </button>
          </div>
        ) : (
          <div className="glass-card p-6">
            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedTopic === topic.id
                      ? 'border-primary-500 bg-primary-500/10 shadow-glow-sm'
                      : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      selectedTopic === topic.id ? 'bg-primary-500' : 'bg-white/10'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{topic.name}</h3>
                      {topic.description && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{topic.description}</p>
                      )}
                    </div>
                    {selectedTopic === topic.id && (
                      <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mb-4">
              <button
                onClick={() => navigate('/editor')}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium inline-flex items-center gap-1 transition-colors"
              >
                Управление темами
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-accent-red text-sm bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={!selectedTopic || loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Создание...
                </span>
              ) : (
                'Создать лобби'
              )}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-2">Хотите присоединиться к игре?</p>
          <button
            onClick={() => navigate('/player/join')}
            className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Подключиться к лобби
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
