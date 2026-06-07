import { useState } from 'react';
import { imageApi } from '../services/api';

interface ImageUploaderProps {
  onUpload: (filename: string) => void;
  currentImage?: string | null;
  onRemove?: () => void;
}

export default function ImageUploader({ onUpload, currentImage, onRemove }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Выберите изображение');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой (макс. 10 МБ)');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await imageApi.upload(file);
      onUpload(response.data.filename);
    } catch {
      setError('Ошибка загрузки');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {currentImage && (
        <div className="relative inline-block">
          <img
            src={`/images/${currentImage}`}
            alt="Вопрос"
            className="max-h-40 rounded-xl border border-gray-700"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ×
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="cursor-pointer bg-gray-700 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors text-sm">
          {currentImage ? 'Заменить' : 'Загрузить изображение'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {uploading && <span className="text-sm text-gray-500">Загрузка...</span>}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
