
const CACHE_NAME = 'bio-hub-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/globals.css',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация и очистка старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов (Strategy: Cache First for static, Network First for others)
self.addEventListener('fetch', (event) => {
  // Пропускаем запросы к API и Firebase
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('firebase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Кэшируем новые запросы к статике
        if (event.request.url.startsWith(self.location.origin) && event.request.method === 'GET') {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Если сети нет и в кэше пусто, отдаем оффлайн-заглушку (если была бы)
      return caches.match('/');
    })
  );
});
