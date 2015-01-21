/*global onmessage, self, XMLHttpRequest, Conf*/
"use strict";

self.onmessage = function (event) {
    if (Conf.logsEndPoint) {
        event.data.forEach(function (event) {
            var req = new XMLHttpRequest();
            req.open('POST', Conf.logsEndPoint + '/logs/events', false);
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(event));
        });
    }

    self.close();
};