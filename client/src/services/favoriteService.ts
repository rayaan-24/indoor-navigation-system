import api from './api';

export const getFavorites = async (userId: string) => {
  const response = await api.get('/favorites', { params: { userId } });
  return response.data;
};

export const createFavorite = async (userId: string, locationId: string, locationType: 'Room' | 'Landmark') => {
  const response = await api.post('/favorites', { userId, locationId, locationType });
  return response.data;
};

export const deleteFavorite = async (id: string, userId?: string) => {
  const response = await api.delete(`/favorites/${id}`, { params: { userId } });
  return response.data;
};
