// TDOLI — Service Worker v1.2
// Fix: fichier manquant qui causait redirect loop sur toutes les pages

const CACHE_NAME = 'tdoli-v1.2';
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
  // Ne pas cacher les appels API backend
  if (url.includes('tdoli-backend.onrender.com')) return;
  // Ne pas cacher les requêtes non-GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Mettre en cache les ressources statiques valides
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
