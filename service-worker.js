const CACHE_NAME = 'finance-manager-cache-v2'; // Increment this version for every update
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './register-sw.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install Event: Cache files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache:', CACHE_NAME);
            return cache.addAll(urlsToCache);
        })
    );
});

// Activate Event: Clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and store the response in the cache
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => caches.match(event.request)) // Fallback to cache if network fails
    );
});
