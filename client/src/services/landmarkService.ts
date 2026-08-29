import api from './api';

export const getLandmarks = async () => {
  const response = await api.get('/landmarks');
  return response.data;
};

export const getLandmarksByFloor = async (floorId: string) => {
  const response = await api.get(`/floors/${floorId}/landmarks`);
  return response.data;
};
