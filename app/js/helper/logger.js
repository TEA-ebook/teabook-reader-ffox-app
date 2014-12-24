/*global define, navigator, window, Teavents*/
define("helper/logger", [ "backbone", "model/event"], function (Backbone, EventModel) {
    "use strict";

    function createEvent(eventData) {
        eventData.sent = false;
        eventData.timestamp = Date.now();
        return new EventModel(eventData);
    }

    function log2db(eventData) {
        var event = createEvent(eventData);
        event.save(null, {
            success: function (model) {
                console.debug("Logged to indexed DB : ", model.attributes);
            }
        });
    }

    function filterBookData(bookData) {
        var data = {
            title: bookData.title,
            publisher: bookData.publisher,
            identifier: bookData.identifier,
            language: bookData.language,
            authors: bookData.authors.join(", ")
        };

        if (bookData.read && bookData.read > 1000000000) {
            data.read = bookData.read;
        }

        return data;
    }

    function handleVisibilityChange() {
        log2db({
            "name": window.document.hidden ? Teavents.Events.CLOSE_APP : Teavents.Events.OPEN_APP,
            "data": { "online": navigator.onLine }
        });
    }

    function logTap(center) {
        log2db({
            "name": Teavents.Events.TAP,
            "data": center
        });
    }

    window.document.addEventListener("visibilitychange", handleVisibilityChange, false);
    Backbone.on(Teavents.Readium.GESTURE_TAP, logTap);

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
        }
    };
});
