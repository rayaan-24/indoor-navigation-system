import api from './api';

export const getBuildings = async () => {
  const response = await api.get('/buildings');
  return response.data;
};

export const getBuildingById = async (id: string) => {
  const response = await api.get(`/buildings/${id}`);
  return response.data;
};

export const getBuildingFloors = async (buildingId: string) => {
  const response = await api.get(`/buildings/${buildingId}/floors`);
  return response.data;
};

export const getBuildingRooms = async (buildingId: string) => {
  const response = await api.get(`/buildings/${buildingId}/rooms`);
  return response.data;
};

// Admin CRUD Operations
export const createBuilding = async (data: any) => {
  const response = await api.post('/buildings', data);
  return response.data;
};

export const updateBuilding = async (id: string, data: any) => {
  const response = await api.put(`/buildings/${id}`, data);
  return response.data;
};

export const deleteBuilding = async (id: string) => {
  const response = await api.delete(`/buildings/${id}`);
  return response.data;
};
