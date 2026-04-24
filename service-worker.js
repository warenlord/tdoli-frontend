// TDOLI — Service Worker v1.4
// Phase 9 — Firebase Messaging intégré

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ── Firebase config ───────────────────────────────────────────
// Remplace ces valeurs par les tiennes (mêmes que dans tdoli-feed.html)
firebase.initializeApp({
  apiKey:            "REMPLACE_PAR_TA_VALEUR",
  authDomain:        "tdoli-c47a1.firebaseapp.com",
  projectId:         "tdoli-c47a1",
  storageBucket:     "tdoli-c47a1.appspot.com",
  messagingSenderId: "REMPLACE_PAR_TA_VALEUR",
  appId:             "REMPLACE_PAR_TA_VALEUR"
});

const messaging = firebase.messaging();

// ── Notification reçue en arrière-plan ───────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notification arrière-plan:', payload);
  const { title, body } = payload.notification || {};
  const url = payload.data?.url || '/tdoli-deals.html';

  self.registration.showNotification(title || 'TDOLI', {
    body:     body || '',
    icon:     '/TDOLI_APP.png',
    badge:    '/TDOLI_APP.png',
    data:     { url },
    tag:      'tdoli-notification',
    renotify: true,
  });
});

// ── Clic sur la notification ──────────────────────────────────
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

// ── Cache PWA ─────────────────────────────────────────────────
const CACHE_NAME = 'tdoli-v1.4';
const STATIC_ASSETS = [
  '/tdoli-feed.html',
  '/tdoli-auth.html',
  '/tdoli-profile.html',
  '/tdoli-deals.html',
  '/tdoli-chat.html',
  '/tdoli-reset.html',
  '/TDOLI_APP.png',
  '/TD_LI.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.includes('tdoli-backend.onrender.com')) return;
  if (url.includes('firebaseinstallations') || url.includes('fcm.googleapis')) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
