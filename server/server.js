var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');

var app = express();

var oneYear = 86400000 * 365;

app.use(compression({
    threshold: 512
}));

app.use(express.static(__dirname + '/frame.html', {
    maxAge: oneYear,
    maxStale: oneYear * 2
}));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.json());

var router = express.Router();

router.route('/events')
    // create an event
    .post(function (req, res) {
        console.log("----------------------------------------------------------");
        console.log(req.body);
        res.status(200).end();
    }
);

app.use("/logs", router);

app.listen(1339);
console.info('iFrame src server started on port 1339');