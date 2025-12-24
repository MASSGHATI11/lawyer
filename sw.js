
const CACHE_NAME = 'lexschedule-local-v15';
const DYNAMIC_CACHE_NAME = 'lexschedule-dynamic-local-v15';

// الأصول الأساسية التي يجب تخزينها مسبقاً (نسخة محلية فقط)
const ASSETS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/metadata.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/AppointmentCard.tsx',
  '/components/ManualEntryModal.tsx',
  '/components/ConfirmModal.tsx',
  '/components/WeeklyCalendar.tsx',
  '/components/NotificationToast.tsx',
  '/components/NotificationPermissionModal.tsx',
  '/components/ArchiveModal.tsx',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1',
  'https://esm.sh/lucide-react@0.344.0',
  'https://cdn-icons-png.flaticon.com/512/924/924915.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching local assets...');
      return Promise.all(
        ASSETS_TO_PRECACHE.map(url => {
          return cache.add(url).catch(err => console.warn('[SW] Pre-cache failed for:', url));
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (new URL(client.url).origin === self.location.origin && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
