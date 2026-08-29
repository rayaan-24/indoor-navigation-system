import api from './api';

export const getRooms = async (filters?: { building?: string; floor?: string; type?: string; query?: string }) => {
  const response = await api.get('/rooms', { params: filters });
  return response.data;
};

export const getRoomById = async (id: string) => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

export const searchLocations = async (query: string) => {
  const response = await api.get('/search', { params: { q: query } });
  return response.data;
};
