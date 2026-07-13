import API from './api';
import axios from 'axios';

export const uploadPaper = async (projectId, file) => {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('pdf', file);

  return API.post('/papers/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getPaper = async (id) => {
  return API.get(`/papers/${id}`);
};

export const deletePaper = async (id) => {
  return API.delete(`/papers/${id}`);
};

/**
 * Downloads a paper export format (Blob based)
 * @param {string} id - Paper ID
 * @param {string} format - Export format (md, json, bib, pdf, docx)
 * @param {string} fileName - Suggested filename
 */
export const downloadPaperExport = async (id, format, fileName) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const url = `${baseURL}/papers/${id}/export?format=${format}`;

  // Using axios directly to handle blob responses
  const response = await axios.get(url, {
    responseType: 'blob',
    withCredentials: true,
  });

  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

const paperService = {
  uploadPaper,
  getPaper,
  deletePaper,
  downloadPaperExport,
};

export default paperService;
