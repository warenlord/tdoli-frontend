// TDOLI — Service Worker v2.0
// Stratégie : Network First pour les HTML, Cache Only pour les assets statiques
// Les API ne sont JAMAIS cachées

const CACHE_NAME = 'tdoli-v4.1';
const STATIC_ASSETS = [
  '/TDOLI_APP.png',
  '/TD_LI.png',
  '/manifest.json',
];

// URLs à ne JAMAIS cacher
const NO_CACHE_PATTERNS = [
  'tdoli-backend.onrender.com',
  'firebaseinstallations',
  'fcm.googleapis',
  'fonts.googleapis',
  'fonts.gstatic',
  'cdn.socket.io',
  'gstatic.com',
];

// Fichiers HTML — toujours récupérer depuis le réseau en priorité
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
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  // Forcer l'activation immédiate sans attendre la fermeture des onglets
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

  // 1. Jamais cacher ces URLs
  if (NO_CACHE_PATTERNS.some(p => url.includes(p))) return;
  if (e.request.method !== 'GET') return;

  // 2. Fichiers HTML — Network First (toujours réseau, cache en fallback)
  const isHTML = HTML_PAGES.some(p => url.includes(p)) || url.endsWith('.html');
  if (isHTML) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 3. Assets statiques — Cache First
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
