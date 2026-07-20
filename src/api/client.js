import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    let message;
    if (error.response) {
      // Server responded with an error status
      message = error.response.data?.message || `Server error (${error.response.status})`;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.';
    } else if (error.message === 'Network Error') {
      message = 'Network error — check your connection and that the server is running.';
    } else {
      message = error.message || 'Something went wrong';
    }
    return Promise.reject(new Error(message));
  }
);

export default client;
