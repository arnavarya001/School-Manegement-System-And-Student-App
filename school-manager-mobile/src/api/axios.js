import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Live Production / Cloud API URL (accessible by physical Android phones anywhere)
export const CLOUD_API_URL = 'https://valued-lang-michel-satisfied.trycloudflare.com/api/v1';
export const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api/v1' : 'http://localhost:5001/api/v1';

const instance = axios.create({
  baseURL: CLOUD_API_URL,
  timeout: 15000,
});

instance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
