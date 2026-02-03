/**
 * Service Worker for TODO PWA Application
 * Implements cache-first strategy for offline functionality
 */

const CACHE_NAME = 'todo-pwa-v1';
const RUNTIME_CACHE = 'todo-pwa-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installed successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Remove old caches that don't match current version
              return (
                name.startsWith('todo-pwa-') &&
                name !== CACHE_NAME &&
                name !== RUNTIME_CACHE
              );
            })
            .map((name) => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated successfully');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - cache-first strategy with network fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return cachedResponse;
      }

      console.log('[Service Worker] Fetching from network:', request.url);

      return fetch(request)
        .then((networkResponse) => {
          // Clone the response before caching
          const responseToCache = networkResponse.clone();

          // Cache the new response for future use
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);

          // Return a custom offline page or response if available
          return caches.match('/index.html').then((fallbackResponse) => {
            return (
              fallbackResponse ||
              new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain',
                }),
              })
            );
          });
        });
    })
  );
});

/**
 * Message event - handle messages from the main app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
