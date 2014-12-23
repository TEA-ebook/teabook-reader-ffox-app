/*global define*/
define("model/event", ["backbone", "database"], function (Backbone, database) {
    "use strict";

    var EventModel = Backbone.Model.extend({
        database: database,
        storeName: "events"
    });

    return EventModel;
});