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
  const [correct, setCorrect] = useState(question?.correct ?? 'A');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError('Заполните все поля');
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
        correct,
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold">
        {question ? 'Редактировать вопрос' : 'Новый вопрос'}
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Текст вопроса</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Что изображено на картинке?"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Изображение</label>
        <ImageUploader
          onUpload={(filename) => setImagePath(filename)}
          currentImage={imagePath}
          onRemove={() => setImagePath('')}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Варианты ответа</label>

        {(['A', 'B', 'C', 'D'] as const).map((letter, index) => {
          const value = [optionA, optionB, optionC, optionD][index];
          const setter = [setOptionA, setOptionB, setOptionC, setOptionD][index];
          const colors = ['blue', 'red', 'green', 'yellow'];

          return (
            <div key={letter} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                value={letter}
                checked={correct === letter}
                onChange={() => setCorrect(letter)}
                className="w-4 h-4"
              />
              <span
                className={`w-8 h-8 rounded-lg bg-${colors[index]}-500 text-white flex items-center justify-center font-bold text-sm`}
              >
                {letter}
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={`Вариант ${letter}`}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          );
        })}

        <p className="text-sm text-gray-500">Отметьте правильный ответ</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {question ? 'Сохранить' : 'Создать'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
