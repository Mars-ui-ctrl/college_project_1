import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://college-project-1-cinx.onrender.com/api',
  withCredentials: true, // Enables sending secure HTTP session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to format responses and catch errors cleanly
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    
    const statusCode = error.response?.status || 500;
    
    console.warn(`API Request Failure: [${statusCode}] ${message}`);
    
    return Promise.reject({
      message,
      statusCode,
      raw: error,
    });
  }
);

export default API;
export { API };
