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
