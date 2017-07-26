const express = require('express');
const path = require('path');
const app = express();

// Set a timer to change the image that gets returned every few seconds
var imageNumber = 1;
setInterval(() => {
    if(++imageNumber > 5) {
        imageNumber = 1;
    }
}, 10 * 1000);

app.get('/', (request, response) => {
    response.sendFile(path.resolve('./views/caching-strategies/index.html'));
});

app.get('/service-worker', (request, response) => {
    response.sendFile(path.resolve('./dist/cachingSW.bundle.js'));
});

app.get('/changing-image', (request, response) => {
    response.sendFile(path.resolve(`./images/Puppy-${imageNumber}.jpg`));
});

module.exports.app = app;