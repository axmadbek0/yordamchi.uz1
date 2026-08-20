export const STORAGE_KEYS = {
  accessToken: 'yordamchi_auth_token',
  refreshToken: 'yordamchi_refresh_token',
  user: 'yordamchi_auth_user',
} as const;

/**
 * Markazlashgan API base.
 * Relative '/api' ishlatiladi — bu har qanday qurilma (localhost, telefon, IP yoki domen)dan
 * to'g'ri ishlashini kafolatlaydi.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || '/api';
