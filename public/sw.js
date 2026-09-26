// public/sw.js
const CACHE_NAME = 'forno-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/ico.webp',
  '/images/table.webp',
  '/images/doughClassic.webp',
  '/images/pOriginal.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, API calls, and external DB requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api') || url.hostname.includes('supabase.co')) {
    return;
  }

  // Cache static images, fonts, and webp assets with Stale-While-Revalidate
  if (url.pathname.startsWith('/images/') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.webp')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || new Response('Offline', { status: 503 });
    })
  );
});