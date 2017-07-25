const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.set('port', (process.env.PORT || 3000));
var env = process.env.NODE_ENV || 'development';

var forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
};

if (env === 'production') {
    app.use(forceSsl);
}

// Set a timer to change the image that gets returned every few seconds
var imageNumber = 1;
setInterval(() => {
    if(++imageNumber > 5) {
        imageNumber = 1;
    }
}, 10 * 1000);

app.use(bodyParser.json({ type: 'application/json' }));

// serve webpack build artifacts, HTML pages and dependencies
app.use('/dist', express.static('dist'));
app.use('/node_modules', express.static('node_modules'));
app.use(express.static('views'));
app.use(express.static('favicons'));

// return the main index file
app.get('/', (request, response) => {
    response.sendFile(path.resolve('views/index.html'));
});

app.get('/changing-image', (request, response) => {
    response.sendFile(path.resolve(`images/Puppy-${imageNumber}.jpg`));
});

app.get('/serviceWorker.js', (request, response) => {
    response.sendFile(path.resolve('dist/serviceWorker.bundle.js'));
})

app.get('/manifest.json', (request, response) => {
    response.sendFile(path.resolve('manifest.json'));
})

// POST endpoint hit when using background sync
app.post('/post-message', (request, response) => {
    // Log & return the message. Normally would be a database transaction here instead
    console.log(`Message received: ${request.body.message}`);
    response.status(200).send(JSON.stringify(request.body));
})

// start  the server on the proper port
app.listen(app.get('port'), (err) => {
    if(err) {
        return console.log('An error occurred', err);
    }

    console.log(`Server is listening on ${app.get('port')}`)
});