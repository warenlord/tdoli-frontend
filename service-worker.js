// TDOLI — Service Worker v1.4

const CACHE_NAME = 'tdoli-v3.6';
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
