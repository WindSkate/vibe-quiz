import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { topicApi, questionApi } from '../services/api';
import { Question, Topic } from '../types';
import QuestionEditor from '../components/QuestionEditor';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [descValue, setDescValue] = useState('');

  const loadData = async () => {
    if (!id) return;

    try {
      const [topicRes, questionsRes] = await Promise.all([
        topicApi.getById(Number(id)),
        questionApi.getByTopic(Number(id)),
      ]);
      setTopic(topicRes.data);
      setQuestions(questionsRes.data);
      setNameValue(topicRes.data.name);
      setDescValue(topicRes.data.description ?? '');
    } catch {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveTopic = async () => {
    if (!topic || !nameValue.trim()) return;

    try {
      await topicApi.update(topic.id, {
        name: nameValue.trim(),
        description: descValue.trim() || undefined,
      });
      setEditingName(false);
      loadData();
    } catch {
      console.error('Failed to update topic');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Удалить вопрос?')) return;

    try {
      await questionApi.delete(questionId);
      loadData();
    } catch {
      console.error('Failed to delete question');
    }
  };

  const handleQuestionSaved = () => {
    setShowQuestionEditor(false);
    setEditingQuestion(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-gray-400">Тема не найдена</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-white">
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/editor')}
            className="text-primary-400 hover:text-primary-300 font-medium mb-3 inline-flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            К списку тем
          </button>

          {editingName ? (
            <div className="glass-card p-4 space-y-3 animate-scale-in">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="input-field text-xl font-bold"
              />
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                placeholder="Описание"
                rows={2}
                className="input-field resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTopic}
                  className="btn-primary text-sm px-4 py-2"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNameValue(topic.name);
                    setDescValue(topic.description ?? '');
                  }}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1
                className="text-2xl font-bold font-display cursor-pointer hover:text-primary-400 transition-colors flex items-center gap-2 group"
                onClick={() => setEditingName(true)}
              >
                {topic.name}
                <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </h1>
              {topic.description && (
                <p className="text-gray-500 mt-1">{topic.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  {questions.length} {questions.length === 1 ? 'вопрос' : questions.length < 5 ? 'вопроса' : 'вопросов'}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {showQuestionEditor && (
          <QuestionEditor
            topicId={topic.id}
            onSave={handleQuestionSaved}
            onCancel={() => setShowQuestionEditor(false)}
          />
        )}

        {editingQuestion && (
          <QuestionEditor
            topicId={topic.id}
            question={editingQuestion}
            onSave={handleQuestionSaved}
            onCancel={() => setEditingQuestion(null)}
          />
        )}

        {!showQuestionEditor && !editingQuestion && (
          <button
            onClick={() => setShowQuestionEditor(true)}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить вопрос
          </button>
        )}

        {questions.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Нет вопросов</p>
            <p className="text-gray-600 text-sm mt-1">Добавьте первый вопрос для этой темы</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="glass-card-hover p-5 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full font-mono">#{index + 1}</span>
                    </div>
                    <p className="font-medium text-gray-100">{q.text}</p>
                    {q.imagePath && (
                      <div className="mt-3">
                        <img
                          src={`/images/${q.imagePath}`}
                          alt=""
                          className="max-h-24 rounded-xl border border-white/10"
                        />
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                        const value = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD }[letter];
                        const isCorrect = q.correct === value;
                        return (
                          <span
                            key={letter}
                            className={`text-sm px-3 py-1.5 rounded-xl flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-accent-green/10 text-accent-green border border-accent-green/20 font-medium'
                                : 'bg-white/5 text-gray-400 border border-white/5'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              isCorrect ? 'bg-accent-green text-white' : 'bg-white/10 text-gray-500'
                            }`}>
                              {letter}
                            </span>
                            {value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                      title="Редактировать"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-red/20 hover:border-accent-red/30 transition-colors"
                      title="Удалить"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
