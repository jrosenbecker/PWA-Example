var parse = require('url-parse');

const VERSION = '1';
const CACHE_NAME = `demo-pwa-${VERSION}`;

var urlsToCache = [
    '/',
    '/caching-strategies.html',
    '/push-notifications.html',
    '/web-share-api.html',
    '/dist/app.bundle.js',
    '/dist/styles.bundle.js',
    '/node_modules/materialize-css/dist/css/materialize.css'
];

// INSTALL Listener
self.addEventListener('install', event => {
    event.waitUntil(
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
    caches.keys().then(keys => Promise.all(
        keys.map(key => {
            if (CACHE_NAME != key) {
                console.log(`Deleting cache: ${key}`);
                return caches.delete(key);
            }
        })
    ));
});

// FETCH Listener
self.addEventListener('fetch', event => {
    var clonedRequest = event.request.clone();
    var url = parse(clonedRequest.url, true);
    var response;

    if (url.pathname === '/changing-image') {
        switch (url.query.cachingStrategy) {
            case 'cacheFirst':
                event.respondWith(cacheFirst(event.request));
                break;
            case 'networkFirst':
                event.respondWith(networkFirst(event.request));
                break;
            default:
                event.respondWith(fetch(event.request));
        }
    } else {
        event.respondWith(networkFirst(event.request));
    }
});

function cacheFirst(request) {
    return caches.match(request).then(
        cachedResponse => {
            // Return the cached response if it is found
            if (cachedResponse) {
                return cachedResponse;
            }

            // If the cached response is not found, use the network and update the cache
            return updateCache(request).then(response => {
                return response;
            });
        }
    )
}

function networkFirst(request) {
    var clonedRequest = request.clone();
    return fetch(request)
        .then(
            response => {
                var clonedResponse = response.clone();
                putResponseInCache(clonedRequest, clonedResponse);
                return response;
            }
        ).catch(
            err => {
                return caches.match(request).then(
                    cachedResponse => {
                        return cachedResponse;
                    }
                );
            }
        );
}

function putResponseInCache(request, response) {
    caches.open(CACHE_NAME).then(cache => {
        console.log(`Updating cache for ${request.url}`);
        cache.put(request, response);
    }).catch(error => {
        console.log(`Error adding request for ${request.url} to cache`);
    });
}

function updateCache(request) {
    // Attempt to fetch the request
    return fetch(request).then(response => {

        // If the fetch is successful, put the response in the cache
        var fetchResponse = response.clone();
        if (fetchResponse.status === 200) {
            putResponseInCache(request, fetchResponse);
        }
        return response;
    }).catch(requestError => {
        // Log if the fetch fails (i.e. you're offline)
        console.log('Cache update failed');
    });
}