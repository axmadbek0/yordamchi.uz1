export const STORAGE_KEYS = {
  accessToken: 'yordamchi_auth_token',
  refreshToken: 'yordamchi_refresh_token',
  user: 'yordamchi_auth_user',
} as const;

/**
 * Markazlashgan API base.
 * Chaqiriqlar: axiosInstance.post('/auth/login') → http://localhost:5000/api/auth/login
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
