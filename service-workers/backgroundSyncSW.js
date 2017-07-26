const VERSION = '1';
const CACHE_NAME = `background-cache-${VERSION}`;

var urlsToCache = [
    '/background-sync'
];

// INSTALL Listener
self.addEventListener('install', event => {
    event.waitUntil(
        // Open the cache and put all of the essential data into it on the install event.
        // Note: This would typically be where you load your 'App Shell'
        caches.open(CACHE_NAME)
            .then(
                cache => {
                    console.log(`Installing using cache ${CACHE_NAME}`);
                    return cache.addAll(urlsToCache);
                }
            )
    );
});

// ACTIVATE Listener
self.addEventListener('activate', event => {
    // Get all of the key values from the Cache API
    // and delete the ones that aren't matching the current
    // version
    caches.keys().then(keys => Promise.all(
        keys.map(key => {
            if (CACHE_NAME != key) {
                console.log(`Deleting cache: ${key}`);
                return caches.delete(key);
            }
        })
    ));
});