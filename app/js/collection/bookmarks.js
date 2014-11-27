/*global define*/
define("collection/bookmarks", ["backbone", "database", "model/bookmark"], function (Backbone, database, BookmarkModel) {
    "use strict";

    var BookmarkCollection = Backbone.Collection.extend({

        model: BookmarkModel,

        database: database,
        storeName: "bookmarks"

    });

    return BookmarkCollection;
});