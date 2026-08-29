import api from './api';

export const getFeedback = async () => {
  const response = await api.get('/feedback');
  return response.data;
};

export const createFeedback = async (data: { issueType: string; message: string; rating?: number; locationId?: string }) => {
  const response = await api.post('/feedback', data);
  return response.data;
};

export const updateFeedbackStatus = async (id: string, status: string) => {
  const response = await api.put(`/feedback/${id}`, { status });
  return response.data;
};
