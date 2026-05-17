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
    return <p className="text-center text-gray-400 py-8">Загрузка...</p>;
  }

  if (!topic) {
    return <p className="text-center text-gray-400 py-8">Тема не найдена</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/editor')}
            className="text-purple-600 hover:text-purple-800 font-medium mb-2 inline-block"
          >
            ← К списку тем
          </button>

          {editingName ? (
            <div className="space-y-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="text-2xl font-bold w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                placeholder="Описание"
                rows={2}
                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTopic}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNameValue(topic.name);
                    setDescValue(topic.description ?? '');
                  }}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1
                className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-purple-600"
                onClick={() => setEditingName(true)}
              >
                {topic.name}
              </h1>
              {topic.description && (
                <p className="text-gray-500 mt-1">{topic.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-1">
                Вопросов: {questions.length}
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
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
            className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold"
          >
            Добавить вопрос
          </button>
        )}

        {questions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Нет вопросов. Добавьте первый!</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-xl shadow p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="text-sm text-gray-400 mr-2">#{index + 1}</span>
                    <span className="font-medium text-gray-800">{q.text}</span>
                    {q.imagePath && (
                      <div className="mt-2">
                        <img
                          src={`/images/${q.imagePath}`}
                          alt=""
                          className="max-h-24 rounded border border-gray-200"
                        />
                      </div>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                        const value = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD }[letter];
                        const isCorrect = q.correct === letter;
                        return (
                          <span
                            key={letter}
                            className={`px-2 py-1 rounded ${
                              isCorrect
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {letter}: {value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Редактировать"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 p-1"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
