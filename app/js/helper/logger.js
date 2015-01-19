/*global define, navigator, window, Teavents, Worker*/
/*jslint bitwise:true*/
define("helper/logger", ["backbone", "collection/events", "model/event"], function (Backbone, EventCollection, EventModel) {
    "use strict";

    var uuid,
        purgeTriggerLimit = 500,
        limit = Math.round(purgeTriggerLimit * 0.8),
        sendUsageReports = window.localStorage.getItem(Teavents.SEND_USAGE_REPORTS);

    // send usage reports is activated by default
    if (sendUsageReports === null) {
        sendUsageReports = true;
        window.localStorage.setItem(Teavents.SEND_USAGE_REPORTS, sendUsageReports);
    }

    function generateUUID() {
        var now, random, id;
        now = Date.now();
        id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            random = (now + Math.random() * 16) % 16 | 0;
            now = Math.floor(now / 16);
            return (c === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
        });
        return id;
    }

    uuid = window.localStorage.getItem("uuid");
    if (!uuid) {
        uuid = generateUUID();
        window.localStorage.setItem("uuid", uuid);
    }

    function createEvent(eventData) {
        eventData.uuid = uuid;
        eventData.sent = "nope";
        eventData.timestamp = Date.now();
        return new EventModel(eventData);
    }

    function send2server() {
        if (sendUsageReports) {
            var events = new EventCollection(),
                eventsData,
                sendLogsWorker;

            events.fetch({ conditions: { sent: "nope" } }).done(function () {
                eventsData = events.toJSON();

                sendLogsWorker = new Worker("sendLogs.js");
                sendLogsWorker.postMessage(eventsData);

                events.models.forEach(function (event) {
                    event.save({ sent: "yes" });
                });
            });
        }
    }

    function clearEvents(conditions) {
        var eventCollection = new EventCollection(),
            eventsToDestroy = [],
            i;

        eventCollection.fetch(conditions).done(function () {
            eventCollection.models.forEach(function (event) {
                eventsToDestroy.push(event);
            });
            for (i = 0; i < eventsToDestroy.length; i += 1) {
                eventsToDestroy[i].destroy();
            }
        });
    }

    function clearPassedEvents() {
        clearEvents({ conditions: { sent: "yes" } });
    }

    function compactEventsTable() {
        var eventCollection = new EventCollection(), nbEvents, eventsToDestroy = [], i;
        eventCollection.fetch().done(function () {
            nbEvents = eventCollection.models.length;
            if (nbEvents >= purgeTriggerLimit) {
                // get events to purge
                eventCollection.models.forEach(function (event) {
                    if ((eventsToDestroy.length < (nbEvents - limit)) && event.get('name') !== Teavents.Events.PURGE) {
                        eventsToDestroy.push(event);
                    }
                });

                // remember that we purged it
                createEvent({
                    name: Teavents.Events.PURGE,
                    data: {
                        from: eventsToDestroy[0].get('timestamp'),
                        to: eventsToDestroy[eventsToDestroy.length - 1].get('timestamp'),
                        number: eventsToDestroy.length
                    }
                }).save().done(function () {
                    console.info(eventsToDestroy.length + " events were removed from indexedDB.");
                });

                // do it
                for (i = 0; i < eventsToDestroy.length; i += 1) {
                    eventsToDestroy[i].destroy();
                }
            }
        });
    }

    function log2db(eventData, send) {
        if (sendUsageReports) {
            var event = createEvent(eventData);
            event.save(null, {
                success: function () {
                    if (send) {
                        if (navigator.onLine) {
                            send2server();
                        } else {
                            compactEventsTable();
                        }
                    } else if (send === false) {
                        clearPassedEvents();
                    }
                }
            });
        }
    }

    function filterBookData(bookData) {
        var data = {
            uuid: bookData.uuid,
            title: bookData.title,
            publisher: bookData.publisher,
            identifier: bookData.identifier,
            language: bookData.language,
            authors: bookData.authors ? bookData.authors.join(", ") : ""
        };

        if (bookData.read && bookData.read > 1000000000) {
            data.read = bookData.read;
        }

        return data;
    }

    function handleVisibilityChange() {
        var appClosed = window.document.hidden === true;
        log2db({
            "name": appClosed ? Teavents.Events.CLOSE_APP : Teavents.Events.OPEN_APP,
            "data": { "online": navigator.onLine }
        }, appClosed);
    }

    function logTap(center) {
        log2db({
            "name": Teavents.Events.TAP,
            "data": center
        });
    }

    function onStorageEvent() {
        sendUsageReports = window.localStorage.getItem(Teavents.SEND_USAGE_REPORTS) === "true";
        if (sendUsageReports === false) {
            clearEvents();
        }
    }

    Backbone.on(Teavents.VISIBILITY_VISIBLE, handleVisibilityChange);
    Backbone.on(Teavents.VISIBILITY_HIDDEN, handleVisibilityChange);
    Backbone.on(Teavents.Readium.GESTURE_TAP, logTap);
    Backbone.on(Teavents.SEND_USAGE_REPORTS, onStorageEvent, false);

    return {
        log: function (name, data) {
            log2db({
                "name": name,
                "data": data
            });
        },

        startApp: function () {
            log2db({
                "name": Teavents.Events.START_APP,
                "data": {
                    "userAgent": navigator.userAgent,
                    "language": navigator.language,
                    "platform": navigator.platform,
                    "online": navigator.onLine,
                    "screen": {
                        width: window.screen.availWidth,
                        height: window.screen.availHeight,
                        pixelDepth: window.screen.pixelDepth
                    }
                }
            });
        },

        deleteBook: function (bookData) {
            log2db({
                "name": Teavents.Events.DELETE_BOOK,
                "data": {
                    book: filterBookData(bookData)
                }
            });
        },

        addBook: function (bookData) {
            log2db({
                "name": Teavents.Events.ADD_BOOK,
                "data": {
                    book: filterBookData(bookData)
                }
            });
        },

        openBook: function (bookData) {
            log2db({
                "name": Teavents.Events.OPEN_BOOK,
                "data": {
                    book: filterBookData(bookData),
                    online: navigator.onLine
                }
            });
        },

        closeBook: function (bookData) {
            log2db({
                "name": Teavents.Events.CLOSE_BOOK,
                "data": {
                    book: filterBookData(bookData),
                    online: navigator.onLine
                }
            });
        },

        generateUUID: generateUUID
    };
});
