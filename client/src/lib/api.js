import axios from 'axios';

const todoApiUrl = process.env.REACT_APP_API_URL || '/api/todos';

// Auth endpoints live beside the existing todo API, so derive the base once.
export const getAuthApiBaseUrl = () => {
  if (/\/api\/todos\/?$/i.test(todoApiUrl)) {
    return todoApiUrl.replace(/\/api\/todos\/?$/i, '/api/auth');
  }

  if (/\/todos\/?$/i.test(todoApiUrl)) {
    return todoApiUrl.replace(/\/todos\/?$/i, '/auth');
  }

  return '/api/auth';
};

export const authApi = axios.create({
  baseURL: getAuthApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});