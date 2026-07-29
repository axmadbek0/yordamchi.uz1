import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';
import type { ApiErrorBody } from './types';

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem('accessToken');
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  window.location.href = '/login';
};

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

/**
 * Markazlashgan Axios instance.
 * baseURL: http://localhost:5000/api
 * Misol: axiosInstance.post('/auth/login', { login, password })
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    localStorage.getItem(STORAGE_KEYS.accessToken) ||
    localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? '';

    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthRoute) {
      if (status === 401 && !isAuthRoute) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axiosInstance.post<{ accessToken: string; token?: string }>(
        '/auth/refresh'
      );

      const newToken = data.accessToken || data.token;
      if (!newToken) {
        throw new Error('Access token olinmadi');
      }

      localStorage.setItem(STORAGE_KEYS.accessToken, newToken);
      localStorage.setItem('accessToken', newToken);
      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      onUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'So\'rov bajarilmadi'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

/** Orqaga moslik */
export const axiosClient = axiosInstance;
export const apiClient = axiosInstance;
