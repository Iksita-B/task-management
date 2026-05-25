import axios from 'axios';

const todoApiUrl = process.env.REACT_APP_API_URL || '/api/todos';
const authTokenStorageKey = 'lanzo-token';

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

export const getStoredAuthToken = () => localStorage.getItem(authTokenStorageKey);

export const getAuthorizedConfig = () => {
  const token = getStoredAuthToken();

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export const authApi = axios.create({
  baseURL: getAuthApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const todoApi = axios.create({
  baseURL: todoApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const attachAuthToken = (config) => {
  const token = getStoredAuthToken();

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
};

authApi.interceptors.request.use(attachAuthToken);
todoApi.interceptors.request.use(attachAuthToken);