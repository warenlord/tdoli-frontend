// TDOLI — Service Worker v4.2
// Stratégie : Network First pour les HTML, Cache Only pour les assets statiques
// Firebase Messaging intégré ici — un seul SW à la portée /

// ── Firebase Messaging (notifications background) ────────────────
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyCYnExAh_LVE6QyhVIR2icN2xC82lqiYfQ",
  authDomain:        "tdoli-c47a1.firebaseapp.com",
  projectId:         "tdoli-c47a1",
  storageBucket:     "tdoli-c47a1.appspot.com",
  messagingSenderId: "416651280494",
  appId:             "1:416651280494:web:de03eb6a47204031f1267f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'TDOLI';
  const body  = (payload.notification && payload.notification.body)  || '';
  const url   = (payload.data && payload.data.url) || '/tdoli-deals.html';
  self.registration.showNotification(title, {
    body,
    icon:      '/TDOLI_APP.png',
    badge:     '/TDOLI_APP.png',
    data:      { url },
    tag:       'tdoli-notif',
    renotify:  true,
  });
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/tdoli-deals.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
      const existing = wins.find(w => w.url.includes('tdoli'));
      if (existing) { existing.focus(); existing.navigate(url); }
      else clients.openWindow(url);
    })
  );
});

// ── Cache ─────────────────────────────────────────────────────────
const CACHE_NAME = 'tdoli-v4.2';
const STATIC_ASSETS = [
  '/TDOLI_APP.png',
  '/TD_LI.png',
  '/manifest.json',
];

const NO_CACHE_PATTERNS = [
  'tdoli-backend.onrender.com',
  'firebaseinstallations',
  'fcm.googleapis',
  'fonts.googleapis',
  'fonts.gstatic',
  'cdn.socket.io',
  'gstatic.com',
];

const HTML_PAGES = [
  '/tdoli-feed.html',
  '/tdoli-auth.html',
  '/tdoli-profile.html',
  '/tdoli-deals.html',
  '/tdoli-chat.html',
  '/tdoli-messages.html',
  '/tdoli-beneficiaires.html',
  '/tdoli-reset.html',
  '/tdoli-cgu.html',
  '/tdoli-admin.html',
  '/service-worker.js',
  '/fcm-init.js',
  '/tdoli-deals-complete.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (NO_CACHE_PATTERNS.some(p => url.includes(p))) return;
  if (e.request.method !== 'GET') return;

  const isHTML = HTML_PAGES.some(p => url.includes(p)) || url.endsWith('.html');
  if (isHTML) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
        }
        return response;
      });
    })
  );
});
