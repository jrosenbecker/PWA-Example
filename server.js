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

// serve webpack build artifacts, HTML pages and dependencies
app.use('/dist', express.static('dist'));
app.use('/node_modules', express.static('node_modules'));
app.use(express.static('favicons'));

app.use('/caching-strategies', require('./controllers/caching-strategies.js').app);
app.use('/background-sync', require('./controllers/background-sync.js').app);

// return the main index file
app.get('/', (request, response) => {
    response.sendFile(path.resolve('views/index.html'));
});

app.get('/service-worker', (request, response) => {
    response.sendFile(path.resolve('./dist/serviceWorker.bundle.js'));
});

app.get('/manifest.json', (request, response) => {
    response.sendFile(path.resolve('manifest.json'));
})

// start  the server on the proper port
app.listen(app.get('port'), (err) => {
    if(err) {
        return console.log('An error occurred', err);
    }

    console.log(`Server is listening on ${app.get('port')}`)
});