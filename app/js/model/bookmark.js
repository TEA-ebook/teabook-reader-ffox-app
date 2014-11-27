/*global define*/
define("model/bookmark", ["backbone", "database"], function (Backbone, database) {
    "use strict";

    var BookmarkModel = Backbone.Model.extend({
        database: database,
        storeName: "bookmarks"
    });

    return BookmarkModel;
});