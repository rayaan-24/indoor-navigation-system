import api from './api';

export const calculateRoute = async (data: {
  sourceId: string;
  destinationId: string;
  preferences?: {
    avoidStairs?: boolean;
    accessibleRoute?: boolean;
  };
}) => {
  const response = await api.post('/navigation/route', data);
  return response.data;
};
