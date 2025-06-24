import axios from 'axios';
import { store } from '../store';
import { setToken, setUser } from '../store/slices/authSlice';

// Base URL for all API endpoints
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Interface representing a user in the system
 * @property id - Unique identifier for the user
 * @property email - User's email address
 * @property name - User's display name (optional)
 * @property stripeData - User's subscription information from Stripe
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  stripeData?: {
    subscriptionStatus: string | null;
    planId: string | null;
  } | null;
}

/**
 * Axios instance configured with:
 * - Base URL for all requests
 * - Credentials included for authentication
 * - JSON content type header
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor
 * Automatically adds the authentication token to all outgoing requests
 * Token is retrieved from Redux store
 */
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

/**
 * Response interceptor
 * Handles authentication errors (401) by clearing the token
 * This forces the user to re-authenticate
 */
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

/**
 * Interface for login request data
 * Supports both password-based and Google OAuth login
 */
interface LoginData {
  email: string;
  password?: string;
  googleToken?: string;
}

/**
 * Interface for signup request data
 * Extends login data to include user's name
 */
interface SignupData extends LoginData {
  name: string;
}

/**
 * Creates a new user account
 * Updates Redux store with authentication token and user data on success
 */
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

/**
 * Authenticates user with email and password
 * Updates Redux store with authentication token and user data on success
 */
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

/**
 * Authenticates user with Google OAuth token
 * Updates Redux store with authentication token and user data on success
 */
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

/**
 * Logs out the current user
 * Clears authentication token and user data from Redux store
 */
export const logout = () => {
  store.dispatch(setToken(null));
  store.dispatch(setUser(null));
};

/**
 * Fetches available subscription plans
 */
export const getPlans = async () => {
  const response = await api.get('/plans');
  return response.data;
};

/**
 * Updates user's subscription to a new plan
 */
export const changeSubscription = async (planId: string) => {
  const response = await api.post('/subscriptions/change', { planId });
  return response.data;
};

/**
 * Fetches current user's profile information
 */
export const getMe = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data;
};

/**
 * Retrieves usage statistics for the current user
 */
export const getUsage = async () => {
  const response = await api.get('/usage');
  return response.data;
};

/**
 * Updates subscription with new price ID
 */
export const updateSubscription = (priceId: string) =>
  api.put('/subscriptions', { priceId });

/**
 * Creates a Stripe checkout session for subscription purchase
 */
export const createCheckoutSession = async (priceId: string) => {
  const response = await api.post('/subscriptions/checkout', { priceId });
  return response.data;
};

/**
 * Cancels the current user's subscription
 */
export const cancelSubscription = async () => {
  const response = await api.post('/subscriptions/cancel');
  return response.data;
};

/**
 * Fetches all projects for the current user
 */
export const getProjects = () =>
  api.get('/projects');

/**
 * Creates a new project
 */
export const createProject = (name: string) =>
  api.post('/projects', { name });

/**
 * Retrieves details of a specific Stripe checkout session
 */
export const getCheckoutSession = async (sessionId: string) => {
  const response = await api.get(`/subscriptions/session/${sessionId}`);
  return response.data;
};

export default api; 