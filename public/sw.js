const CACHE_NAME = 'bio-hub-pro-v4';
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
  // Пропускаем запросы к API и Firestore
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Кэшируем новые статические файлы (шрифты, скрипты чанков)
        if (event.request.url.includes('_next/static') || 
            event.request.url.includes('fonts.gstatic.com')) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Оффлайн-заглушка для навигации
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
