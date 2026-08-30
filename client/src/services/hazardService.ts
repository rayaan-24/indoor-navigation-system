import api from './api';

export const getHazards = async () => {
  const response = await api.get('/hazards');
  return response.data;
};

export const createHazard = async (data: {
  type: string;
  locationId: string;
  x?: number;
  y?: number;
  radius?: number;
  weight?: number;
}) => {
  const response = await api.post('/hazards', data);
  return response.data;
};

export const deleteHazard = async (id: string) => {
  const response = await api.delete(`/hazards/${id}`);
  return response.data;
};
