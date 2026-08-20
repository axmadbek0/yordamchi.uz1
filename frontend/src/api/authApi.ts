import { UserRole } from '../types';
import { STORAGE_KEYS } from './constants';
import { axiosInstance, getApiErrorMessage } from './axios';
import { LoginResponse } from './types';

export interface LoginParams {
  login: string;
  password: string;
  role?: UserRole;
  schoolNumber?: number;
}

export function persistAuthSession(data: LoginResponse): void {
  const token = data.accessToken || data.token;
  localStorage.setItem(STORAGE_KEYS.accessToken, token);
  localStorage.setItem('accessToken', token);
}

export function clearAuthSession(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem('accessToken');
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
}

/**
 * POST http://localhost:5000/api/auth/login
 * Chaqiriq: axiosInstance.post('/auth/login', ...)
 */
export async function loginRequest(params: LoginParams): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/login', {
    login: params.login.trim(),
    password: params.password,
    role: params.role,
    schoolNumber: params.schoolNumber,
  });

  persistAuthSession(data);
  return data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await axiosInstance.post('/auth/logout');
  } finally {
    clearAuthSession();
  }
}

export async function fetchCurrentUser() {
  const { data } = await axiosInstance.get<{ user: LoginResponse['user'] }>('/auth/me');
  return data.user;
}

export { getApiErrorMessage };
