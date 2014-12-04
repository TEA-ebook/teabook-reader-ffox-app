/*global define*/
define("collection/books", ["backbone", "database", "model/book"], function (Backbone, database, BookModel) {
    "use strict";

    var BookCollection = Backbone.Collection.extend({

        model: BookModel,

        database: database,
        storeName: "books"

    });

    return BookCollection;
});