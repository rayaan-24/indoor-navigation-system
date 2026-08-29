import api from './api';

export const getRoutes = async () => {
  const response = await api.get('/routes');
  return response.data;
};

export const getRouteMatch = async (from: string, to: string) => {
  const response = await api.get('/routes', { params: { from, to } });
  return response.data;
};
