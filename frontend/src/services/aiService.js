import API from './api';

export const sendMessage = async ({ projectId, paperId = null, chatId = null, text }) => {
  return API.post('/ai/chat', { projectId, paperId, chatId, text });
};

export const getChatSession = async (projectId, paperId = null) => {
  const url = paperId
    ? `/ai/chat/session?projectId=${projectId}&paperId=${paperId}`
    : `/ai/chat/session?projectId=${projectId}`;
  return API.get(url);
};

export const generateQuiz = async ({ paperId, difficulty = 'medium' }) => {
  return API.post('/ai/quizzes/generate', { paperId, difficulty });
};

export const submitQuiz = async ({ quizId, answers }) => {
  return API.post('/ai/quizzes/submit', { quizId, answers });
};

export const generateFlashcards = async ({ paperId }) => {
  return API.post('/ai/flashcards/generate', { paperId });
};

export const getDueCards = async (projectId) => {
  return API.get(`/ai/flashcards/due?projectId=${projectId}`);
};

export const reviewCard = async (id, score) => {
  return API.post(`/ai/flashcards/${id}/review`, { score });
};

export const favoriteCard = async (id) => {
  return API.post(`/ai/flashcards/${id}/favorite`);
};

export const comparePapers = async (paper1Id, paper2Id) => {
  return API.post('/ai/compare', { paper1Id, paper2Id });
};

const aiService = {
  sendMessage,
  getChatSession,
  generateQuiz,
  submitQuiz,
  generateFlashcards,
  getDueCards,
  reviewCard,
  favoriteCard,
  comparePapers,
};

export default aiService;
