const APP_SHELL_CACHE = 'tech-store-shell-v1';
const RUNTIME_CACHE = 'tech-store-runtime-v1';
const IMAGE_CACHE = 'tech-store-images-v1';
const OFFLINE_URL = '/offline.html';

const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const actualCaches = [APP_SHELL_CACHE, RUNTIME_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !actualCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstPage(event.request));
    return;
  }

  if (event.request.destination === 'image') {
    event.respondWith(cacheFirstImage(event.request));
    return;
  }

  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

async function networkFirstPage(request) {
  try {
    const freshResponse = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, freshResponse.clone());
    return freshResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match(OFFLINE_URL);
  }
}

async function cacheFirstImage(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(IMAGE_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return caches.match('/logo192.png');
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch(() => null);

  return cachedResponse || networkPromise || caches.match(OFFLINE_URL);
}
