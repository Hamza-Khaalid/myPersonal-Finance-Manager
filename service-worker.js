const CACHE_NAME = "finance-manager-cache-v4"; // Increment version for new cache
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./register-sw.js",
  "./manifest.json",
  "./icon-192-new.png",
  "./icon-512-new.png",
];

// Install Event: Cache all necessary files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache:", CACHE_NAME);
      return cache.addAll(urlsToCache).catch((err) => {
        console.error("Failed to cache during install:", err);
      });
    })
  );

  // Force this service worker to become active
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Keep only the current cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim clients immediately
  self.clients.claim();
});

// Fetch Event: Network first, fallback to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          } else {
            console.error("Resource not found in cache:", event.request.url);
          }
        });
      })
  );
});
