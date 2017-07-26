var parse = require('url-parse');
var idbKeyval = require('idb-keyval');

const VERSION = '1';
const CACHE_NAME = `root-cache-${VERSION}`;

var urlsToCache = [
    '/',
    '/dist/app.bundle.js',
    '/dist/styles.bundle.js',
    '/node_modules/materialize-css/dist/css/materialize.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    '/apple-touch-icon.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/manifest.json',
    '/safari-pinned-tab.svg'
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

// FETCH Listener
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if(event.request.method === 'GET') {
        var clonedRequest = event.request.clone();
        var url = parse(clonedRequest.url, true);

        // Handle requests to the changing image endpoint seperately
        if (url.pathname === '/changing-image') {
            
            // Change how the request gets cached based on the query parameter
            switch (url.query.cachingStrategy) {
                case 'cacheFirst':
                    event.respondWith(cacheFirst(event.request));
                    break;
                case 'networkFirst':
                    event.respondWith(networkFirst(event.request));
                    break;
                case 'backgroundUpdate':
                    event.respondWith(cacheFirst(event.request));
                    event.waitUntil(updateCache(clonedRequest));
                    break;
                default:
                    event.respondWith(fetch(event.request));
            }
        } else {
            // Use the background update strategy for all other requests
            event.respondWith(cacheFirst(event.request));
            event.waitUntil(updateCache(clonedRequest));
        }
    }
});

// SYNC listener
self.addEventListener('sync', event => {
    // Handle the sync if it has the proper tag (or if triggered from chrome debugger)
    if(event.tag === 'message-sync' || event.tag === 'test-tag-from-devtools') {

        // Get the message back out of indexedDB for use sending the request
        event.waitUntil(idbKeyval.get('message').then(message => {

            // Send a post request to the server using the message stored
            // in indexedDB
            fetch('/post-message', {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(message)
            }).then(result => {

                // When returned successfully, delete the message from indexedDB
                idbKeyval.delete('message').then(() => {
                    console.log('Message deleted for idb-keyval');
                });
            }).catch(() => {
                
                // If there was an error with the request, keep the value in
                // indexedDB in case the sync event were to fire again later
                console.log('Sync post request failed, trying again later');  
            });
        }));
    }
})

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
    // Clone the request (it doesn't like it if you send a request and then
    // try to use that same request when caching)
    var clonedRequest = request.clone();
    return fetch(request)
        .then(
            // Return the network response after updating it in the cache
            response => {
                var clonedResponse = response.clone();
                putResponseInCache(clonedRequest, clonedResponse);
                return response;
            }
        ).catch(
            // If the network request fails, then fallback to using
            // the cached data
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