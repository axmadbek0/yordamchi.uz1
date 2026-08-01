/* eslint-disable no-undef */
/**
 * Background push (ilova yopiq bo‘lganda)
 * Haqiqiy FCM: firebase config ni to‘ldiring va messaging.onBackgroundMessage ulang.
 *
 * Hozircha: push event kelganda generic notification ko‘rsatadi.
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let title = 'Yordamchi Med';
  let body = 'Yangi bildirishnoma';
  try {
    const data = event.data ? event.data.json() : null;
    if (data?.notification?.title) title = data.notification.title;
    if (data?.notification?.body) body = data.notification.body;
    if (data?.title) title = data.title;
    if (data?.body) body = data.body;
  } catch {
    if (event.data) body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logo-192.png',
      badge: '/logo-192.png',
      data: { url: '/parent/notifications' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/parent/notifications';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

/*
 * Firebase FCM (ishlab chiqarish):
 * importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
 * importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');
 * firebase.initializeApp({ apiKey, authDomain, projectId, messagingSenderId, appId });
 * firebase.messaging().onBackgroundMessage((payload) => { ... showNotification ... });
 */
