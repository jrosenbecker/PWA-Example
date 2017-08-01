console.log('It worked!');
if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
        .then(
            registration => {
                console.log('Service worker registration successful');
            },
            error => {
                console.error('Service worker registration failed: ', error);
            }
        );
}