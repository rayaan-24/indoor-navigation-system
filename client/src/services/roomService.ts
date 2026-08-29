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

// Admin CRUD Operations
export const createRoom = async (data: any) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: string, data: any) => {
  const response = await api.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id: string) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};
