/*global onmessage, self, XMLHttpRequest*/
"use strict";

onmessage = function (event) {
    var logs;

    logs = event.data;

    logs.forEach(function (event) {
        var req = new XMLHttpRequest();
        req.open('POST', 'http://192.168.10.10:1339/logs/events', false);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(event));
        if(req.status == 200) {
            console.log("event sent to server :", event.name, event.timestamp);
        }
    });

    self.close();
};