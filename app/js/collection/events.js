/*global define*/
define("collection/events", ["backbone", "database", "model/event"], function (Backbone, database, EventModel) {
    "use strict";

    var EventCollection = Backbone.Collection.extend({

        model: EventModel,

        database: database,
        storeName: "events"

    });

    return EventCollection;
});