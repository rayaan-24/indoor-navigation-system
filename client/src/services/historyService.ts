import api from './api';

export const getHistory = async (userId: string) => {
  const response = await api.get('/history', { params: { userId } });
  return response.data;
};

export const createHistory = async (data: { userId: string; source: string; destination: string; distance?: number; estimatedTime?: number }) => {
  const response = await api.post('/history', data);
  return response.data;
};

export const clearHistory = async (userId?: string) => {
  const response = await api.delete('/history', { params: { userId } });
  return response.data;
};
