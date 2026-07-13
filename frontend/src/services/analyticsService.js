import API from './api';

export const getDashboard = async (projectId = null) => {
  const url = projectId ? `/analytics/dashboard?projectId=${projectId}` : '/analytics/dashboard';
  return API.get(url);
};

export const logEvent = async ({ projectId, eventType, details = {} }) => {
  return API.post('/analytics/log', { projectId, eventType, details });
};

const analyticsService = {
  getDashboard,
  logEvent,
};

export default analyticsService;
