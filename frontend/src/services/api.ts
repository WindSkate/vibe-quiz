import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      throw { message: 'Нет соединения с сервером' };
    }
    const message = error.response.data?.message || error.response.data?.error || 'Произошла ошибка';
    throw { message, status: error.response.status, data: error.response.data };
  }
);

export const topicApi = {
  getAll: () => api.get('/topics'),
  getById: (id: number) => api.get(`/topics/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/topics', data),
  update: (id: number, data: { name: string; description?: string }) =>
    api.put(`/topics/${id}`, data),
  delete: (id: number) => api.delete(`/topics/${id}`),
};

export const questionApi = {
  getByTopic: (topicId: number) => api.get(`/topics/${topicId}/questions`),
  create: (topicId: number, data: Record<string, unknown>) =>
    api.post(`/topics/${topicId}/questions`, data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/questions/${id}`, data),
  delete: (id: number) => api.delete(`/questions/${id}`),
};

export const lobbyApi = {
  create: (topicId: number) => api.post('/lobbies', { topicId }),
  join: (code: string, data: { playerName: string }) => api.post(`/lobbies/${code}/join`, data),
  getInfo: (code: string) => api.get(`/lobbies/${code}`),
  getPlayers: (code: string) => api.get(`/lobbies/${code}/players`),
  delete: (code: string) => api.delete(`/lobbies/${code}`),
};

export const imageApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (filename: string) => api.delete(`/images/${filename}`),
};

export default api;
