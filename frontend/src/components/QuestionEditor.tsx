import { useState } from 'react';
import { questionApi } from '../services/api';
import ImageUploader from './ImageUploader';
import { Question } from '../types';

interface QuestionEditorProps {
  topicId: number;
  question?: Question;
  onSave: () => void;
  onCancel: () => void;
}

export default function QuestionEditor({ topicId, question, onSave, onCancel }: QuestionEditorProps) {
  const [text, setText] = useState(question?.text ?? '');
  const [imagePath, setImagePath] = useState(question?.imagePath ?? '');
  const [optionA, setOptionA] = useState(question?.optionA ?? '');
  const [optionB, setOptionB] = useState(question?.optionB ?? '');
  const [optionC, setOptionC] = useState(question?.optionC ?? '');
  const [optionD, setOptionD] = useState(question?.optionD ?? '');
  const [correct, setCorrect] = useState(question?.correct ?? '');
  const [error, setError] = useState('');

  const handleOptionChange = (setter: (value: string) => void, oldValue: string, newValue: string) => {
    setter(newValue);
    if (correct === oldValue) {
      setCorrect(newValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError('Заполните все поля');
      return;
    }

    if (!correct.trim()) {
      setError('Выберите правильный ответ');
      return;
    }

    try {
      const data = {
        topicId,
        text: text.trim(),
        imagePath: imagePath || null,
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correct: correct.trim(),
      };

      if (question) {
        await questionApi.update(question.id, data);
      } else {
        await questionApi.create(topicId, data);
      }

      onSave();
    } catch {
      setError('Ошибка сохранения');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 animate-scale-in">
      <h3 className="text-lg font-semibold font-display flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {question ? 'Редактировать вопрос' : 'Новый вопрос'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Текст вопроса</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Что изображено на картинке?"
          rows={2}
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Изображение</label>
        <ImageUploader
          onUpload={(filename) => setImagePath(filename)}
          currentImage={imagePath}
          onRemove={() => setImagePath('')}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300">Варианты ответа</label>

        {(['A', 'B', 'C', 'D'] as const).map((letter, index) => {
          const value = [optionA, optionB, optionC, optionD][index];
          const setter = [setOptionA, setOptionB, setOptionC, setOptionD][index];
          const isCorrect = correct === value;

          return (
            <div
              key={letter}
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                isCorrect
                  ? 'border-accent-green/50 bg-accent-green/10'
                  : 'border-white/5 bg-white/5 hover:border-white/10'
              }`}
            >
              <input
                type="radio"
                name="correct"
                value={value}
                checked={correct === value}
                onChange={() => setCorrect(value)}
                className="w-4 h-4 accent-accent-green"
              />
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                isCorrect ? 'bg-accent-green text-white' : 'bg-white/10 text-gray-400'
              }`}>
                {letter}
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => handleOptionChange(setter, value, e.target.value)}
                placeholder={`Вариант ${letter}`}
                className="flex-1 px-4 py-2 bg-transparent border-none text-white placeholder-gray-600 focus:ring-0 outline-none"
              />
            </div>
          );
        })}

        <p className="text-sm text-gray-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Отметьте правильный ответ
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-accent-red text-sm bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {question ? 'Сохранить' : 'Создать'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
