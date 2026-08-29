import api from './api';

export const getLandmarks = async () => {
  const response = await api.get('/landmarks');
  return response.data;
};

export const getLandmarksByFloor = async (floorId: string) => {
  const response = await api.get(`/floors/${floorId}/landmarks`);
  return response.data;
};

// Admin CRUD Operations
export const createLandmark = async (data: any) => {
  const response = await api.post('/landmarks', data);
  return response.data;
};

export const updateLandmark = async (id: string, data: any) => {
  const response = await api.put(`/landmarks/${id}`, data);
  return response.data;
};

export const deleteLandmark = async (id: string) => {
  const response = await api.delete(`/landmarks/${id}`);
  return response.data;
};
