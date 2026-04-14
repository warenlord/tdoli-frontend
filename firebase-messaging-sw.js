importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Remplace chaque valeur par celle de ton .env
firebase.initializeApp({
  apiKey: "AIzaSyCYnExAh_LVE6QyhVIR2icN2xC82lqiYfQ",
  authDomain: "tdoli-c47a1.firebaseapp.com",
  projectId: "tdoli-c47a1",
  storageBucket: "tdoli-c47a1.firebasestorage.app",
  messagingSenderId: "416651280494",
  appId: "1:416651280494:web:de03eb6a47204031f1267f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification;
  const data = payload.data || {};

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
