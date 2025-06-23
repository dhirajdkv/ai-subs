import axios from 'axios';
import { store } from '../store';
import { setToken, setUser } from '../store/slices/authSlice';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 responses
      localStorage.removeItem('token');
      store.dispatch(setToken(null));
    }
    return Promise.reject(error);
  }
);

interface LoginData {
  email: string;
  password?: string;
  googleToken?: string;
}

interface SignupData extends LoginData {
  name: string;
}

export const signup = async (email: string, password: string, name: string) => {
  try {
    const response = await api.post('/auth/signup', { email, password, name });
    const { token, user } = response.data;
    store.dispatch(setToken(token));
    store.dispatch(setUser(user));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    store.dispatch(setToken(token));
    store.dispatch(setUser(user));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async (token: string) => {
  try {
    const response = await api.post('/auth/google', { token });
    const { token: authToken, user } = response.data;
    store.dispatch(setToken(authToken));
    store.dispatch(setUser(user));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  store.dispatch(setToken(null));
  store.dispatch(setUser(null));
};

export const getPlans = async () => {
  const response = await api.get('/plans');
  return response.data;
};

export const changeSubscription = async (planId: string) => {
  const response = await api.post('/subscriptions/change', { planId });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getUsage = async () => {
  const response = await api.get('/usage');
  return response.data;
};

export default api; 