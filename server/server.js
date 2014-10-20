var express = require('express');
var compression = require('compression');

var app = express();

var oneYear = 86400000 * 365;

app.use(compression({
    threshold: 512
}));

app.use(express.static(__dirname + '/', {
    maxAge: oneYear,
    maxStale: oneYear * 2
}));

app.listen(1339);
console.info('iFrame src server started on port 1339');