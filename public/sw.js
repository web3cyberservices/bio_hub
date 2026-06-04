const CACHE_NAME = 'bio-hub-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/bio-hologram.png',
  '/woman_hologram.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Не кэшируем запросы к Firebase API и Auth
  if (url.origin.includes('firebaseio.com') || url.origin.includes('googleapis.com') || url.pathname.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((fetchResponse) => {
        // Кэшируем шрифты, изображения и внешние скрипты
        if (
          fetchResponse.status === 200 &&
          (url.origin.includes('fonts.gstatic.com') ||
           url.origin.includes('telegram.org') ||
           url.origin.includes('transparenttextures.com') ||
           url.origin.includes('placehold.co') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.css'))
        ) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Если сеть недоступна и ресурса нет в кэше
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
