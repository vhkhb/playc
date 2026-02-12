import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:5000/api'
  : 'https://api.playc.com/api';

const STORAGE_TOKEN_KEY = '@playc_auth_token';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
};

export const removeAuthToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
};

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
};

export { API_BASE_URL, STORAGE_TOKEN_KEY };
export default apiClient;
