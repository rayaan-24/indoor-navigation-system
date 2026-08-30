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

export const calculateEvacuationRoute = async (data: {
  sourceId: string;
  preferences?: {
    avoidStairs?: boolean;
  };
}) => {
  const response = await api.post('/navigation/evacuate', data);
  return response.data;
};
