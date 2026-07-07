import api from './api.js';
import useAuthStore from '../store/authStore.js';

/**
 * Register a new user (patient or doctor)
 * @param {Object} data - { name, email, password, role, phone, specialization?, experience? }
 */
export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  const { token, user } = response.data || {};
  if (!token || !user) {
    throw Object.assign(new Error('Invalid response from server'), {
      response: { data: { message: 'Invalid server response. Is VITE_API_URL set to …/api?' } },
    });
  }
  useAuthStore.getState().setAuth(user, token);
  return response.data;
};

/**
 * Login with email + password
 * @param {string} email
 * @param {string} password
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data || {};
  if (!token || !user) {
    throw Object.assign(new Error('Invalid response from server'), {
      response: { data: { message: 'Invalid server response. Is VITE_API_URL set to …/api?' } },
    });
  }
  useAuthStore.getState().setAuth(user, token);
  return response.data;
};

/**
 * Fetch current user from backend (validates token)
 */
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.user;
};

/**
 * Logout — clears store + localStorage
 */
export const logout = () => {
  useAuthStore.getState().logout();
};
