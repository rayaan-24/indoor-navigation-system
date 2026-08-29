import api from './api';

// Users Management APIs
export const getUsers = async (page = 1, limit = 20) => {
  const response = await api.get(`/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const response = await api.put(`/users/${id}`, { role });
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Graph Connections Management APIs
export const getConnections = async () => {
  const response = await api.get('/connections');
  return response.data;
};

export const createConnection = async (data: {
  fromNode: string;
  toNode: string;
  distance: number;
  type: string;
  isActive?: boolean;
  accessibility?: boolean;
  floor: number;
  pathPoints: { x: number; y: number }[];
}) => {
  const response = await api.post('/connections', data);
  return response.data;
};

export const updateConnection = async (id: string, data: any) => {
  const response = await api.put(`/connections/${id}`, data);
  return response.data;
};

export const deleteConnection = async (id: string) => {
  const response = await api.delete(`/connections/${id}`);
  return response.data;
};
