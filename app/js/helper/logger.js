/*global define*/
define("helper/logger", [ "model/event" ], function (EventModel) {
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

    return {
        log: function (name, data) {
            log2db({
                "name": name,
                "data": data
            });
        }
    };
});
