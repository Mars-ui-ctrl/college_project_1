import API from './api';
import axios from 'axios';

export const getNotes = async (projectId) => {
  return API.get(`/notes?projectId=${projectId}`);
};

export const createNote = async (noteData) => {
  return API.post('/notes', noteData);
};

export const updateNote = async (id, noteData) => {
  return API.patch(`/notes/${id}`, noteData);
};

export const deleteNote = async (id) => {
  return API.delete(`/notes/${id}`);
};

/**
 * Downloads a note export format (Blob based)
 * @param {string} id - Note ID
 * @param {string} format - Export format (md, json, pdf, docx)
 * @param {string} fileName - Suggested filename
 */
export const downloadNoteExport = async (id, format, fileName) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const url = `${baseURL}/notes/${id}/export?format=${format}`;

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

const noteService = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  downloadNoteExport,
};

export default noteService;
