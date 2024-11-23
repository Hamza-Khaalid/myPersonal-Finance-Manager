const CACHE_NAME = "finance-manager-cache-v5"; // Increment version for updates
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

// Install Event: Cache necessary files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache:", CACHE_NAME);
      return cache.addAll(urlsToCache).catch((err) => {
        console.error("Failed to cache during install:", err);
      });
    })
  );

  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
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

// Fetch Event: Cache-first strategy with fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method === "GET") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }

        // Fetch from network and cache the response
        return fetch(event.request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== "basic"
            ) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch((err) => {
            console.error("Network fetch failed:", err);
          });
      })
    );
  }
});
