import API from './api';

export const getProjects = async () => {
  return API.get('/projects');
};

export const createProject = async ({ title, description }) => {
  return API.post('/projects', { title, description });
};

export const getProject = async (id) => {
  return API.get(`/projects/${id}`);
};

export const deleteProject = async (id) => {
  return API.delete(`/projects/${id}`);
};

const projectService = {
  getProjects,
  createProject,
  getProject,
  deleteProject,
};

export default projectService;
