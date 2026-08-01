/**
 * Web Push / FCM token olish (PWA)
 * Firebase kalitlari .env da bo‘lmasa — brauzer Notification API + mock token
 */

import { setPushEnabled, setStoredFcmToken, isPushEnabled } from '../notificationsApi';

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setPushEnabled(false);
      return null;
    }

    setPushEnabled(true);

    // Haqiqiy FCM: VITE_FIREBASE_* + getToken(messaging, { vapidKey })
    const vapid = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
    if (vapid && import.meta.env.VITE_FIREBASE_API_KEY) {
      // Firebase SDK o‘rnatilganda shu yerga getMessaging/getToken ulang
      console.info('[push] Firebase sozlangan — FCM token olishni ulang');
    }

    const mockToken = `web-push-mock-${Date.now()}`;
    setStoredFcmToken(mockToken);

    // Service worker ro‘yxatdan o‘tkazish (background xabarlar uchun)
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (err) {
        console.warn('[push] SW register:', err);
      }
    }

    return mockToken;
  } catch (error) {
    console.error('Push ruxsat berilmadi:', error);
    setPushEnabled(false);
    return null;
  }
}

export async function disablePushNotifications(): Promise<void> {
  setPushEnabled(false);
  setStoredFcmToken(null);
}

export { isPushEnabled };
