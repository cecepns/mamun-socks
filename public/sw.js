const CACHE_NAME = 'mamun-socks-' + Date.now();
const ASSETS = [
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith('mamun-socks-') || key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle GET requests and non-API requests
  if (e.request.method !== 'GET' || e.request.url.includes('/api/')) {
    return;
  }

  // Bypass cache completely for HTML pages (accept: text/html) so Vercel redeployment is reflected instantly
  const isHtml = e.request.headers.get('Accept')?.includes('text/html') || e.request.url.endsWith('/') || e.request.url.endsWith('.html');
  if (isHtml) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // If valid response, cache it and return
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(e.request);
      })
  );
});
