import API from './api';

export const register = async ({ username, email, password }) => {
  return API.post('/auth/register', { username, email, password });
};

export const login = async ({ email, password }) => {
  return API.post('/auth/login', { email, password });
};

export const logout = async () => {
  return API.post('/auth/logout');
};

export const getProfile = async () => {
  return API.get('/auth/profile');
};

export const updateProfile = async ({ username, avatar }) => {
  return API.put('/auth/profile', { username, avatar });
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
};

export default authService;
