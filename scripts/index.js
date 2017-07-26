if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker')
        .then(
            registration => {
                console.log('Service worker registration successful');
            },
            error => {
                console.error('Service worker registration failed: ', error);
            }
        );

    navigator.serviceWorker.register('/caching-strategies/service-worker', { scope: './caching-strategies/'})
        .then(
            registration => {
                console.log('Caching strategies service worker registration successful');
            },
            error => {
                console.error('Caching strateegies service worker registration failed: ', error);
            }
        );

    navigator.serviceWorker.register('/background-sync/service-worker', { scope: './background-sync/' })
        .then(
            registration => {
                console.log('Background sync service worker registration successful');
            },
            error => {
                console.error('Background sync service worker registration failed: ', error);
            }
        );
}