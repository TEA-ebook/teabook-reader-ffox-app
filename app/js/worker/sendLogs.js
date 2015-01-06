/*global onmessage, self, XMLHttpRequest, Conf*/
"use strict";

onmessage = function (event) {
    var logs;

    logs = event.data;

    logs.forEach(function (event) {
        var req = new XMLHttpRequest();
        req.open('POST', Conf.host + '/logs/events', false);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(event));
    });

    self.close();
};