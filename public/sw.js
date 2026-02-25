const CACHE_NAME = 'crave-bakery-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/offline',
                '/favicon.ico',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only intercept HTML navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline');
            })
        );
    }
});
