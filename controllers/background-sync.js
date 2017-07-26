const express = require('express');
const path = require('path');
const  bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.json({ type: 'application/json' }));

app.get('/', (request, response) => {
    response.sendFile(path.resolve('./views/background-sync/index.html'));
});

app.get('/service-worker', (request, response) => {
    response.sendFile(path.resolve('./dist/backgroundSyncSW.bundle.js'));
});

// POST endpoint hit when using background sync
app.post('/post-message', (request, response) => {
    // Log & return the message. Normally would be a database transaction here instead
    console.log(`Message received: ${request.body.message}`);
    response.status(200).send(JSON.stringify(request.body));
});

module.exports.app = app;