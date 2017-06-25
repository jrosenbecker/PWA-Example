const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

var imageNumber = 1;
setInterval(() => {
    if(++imageNumber > 5) {
        imageNumber = 1;
    }
}, 10 * 1000);

// serve webpack build artifacts, HTML pages and dependencies
app.use('/dist', express.static('dist'));
app.use('/node_modules', express.static('node_modules'));
app.use(express.static('views'));

// return the main index file
app.get('/', (request, response) => {
    response.sendFile(path.resolve('views/index.html'));
});

app.get('/changing-image', (request, response) => {
    response.sendFile(path.resolve(`images/Puppy-${imageNumber}.jpg`));
});

// start  the server on the proper port
app.listen(port, (err) => {
    if(err) {
        return console.log('An error occurred', err);
    }

    console.log(`Server is listening on ${port}`)
});