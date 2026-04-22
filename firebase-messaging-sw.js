// TDOLI — Firebase Messaging Service Worker
// Gère les notifications push en arrière-plan

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyCYnExAh_LVE6QyhVIR2icN2xC82lqiYfQ",  // ← remplace avec ta vraie valeur
  authDomain:        "tdoli-c47a1.firebaseapp.com",
  projectId:         "tdoli-c47a1",
  storageBucket:     "tdoli-c47a1.appspot.com",
  messagingSenderId: "416651280494", // ← remplace avec ta vraie valeur
  appId:             "1:416651280494:web:de03eb6a47204031f1267f", // ← remplace avec ta vraie valeur
});

const messaging = firebase.messaging();

// Notification reçue en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notification arrière-plan:', payload);

  const { title, body, icon } = payload.notification || {};
  const url = payload.data?.url || '/tdoli-deals.html';

  self.registration.showNotification(title || 'TDOLI', {
    body:    body || '',
    icon:    icon || '/TDOLI_APP.png',
    badge:   '/TDOLI_APP.png',
    data:    { url },
    actions: [{ action: 'open', title: 'Voir' }],
    tag:     'tdoli-notification',
    renotify: true,
  });
});

// Clic sur la notification → ouvrir la page correspondante
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/tdoli-deals.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
      const existing = wins.find(w => w.url.includes('tdoli'));
      if (existing) { existing.focus(); existing.navigate(url); }
      else clients.openWindow(url);
    })
  );
});
