const CACHE_NAME = "safepath-resilience-v2";
const APP_SHELL = [
  "/", 
  "/dashboard", 
  "/survival", 
  "/survival-kit", 
  "/communication",
  "/offline-guide",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  
  // Stale-while-revalidate for APIs, Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          const cacheCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
          return response;
        })
        .catch(() => {
          // If offline and not in cache, fallback to offline guide
          if (event.request.mode === 'navigate') {
            return caches.match("/offline-guide");
          }
        });
        
      return cached || networked;
    })
  );
});

// Listen for background sync event for the offline emergency queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-emergency-reports') {
    console.log('[SW] Background sync triggered: sync-emergency-reports');
    // Note: Actual DB processing happens in the browser context usually via online listeners,
    // but the SW can also intercept it if using a full library. For this setup, we just log it
    // and rely on window.addEventListener('online') in the main thread.
  }
});
