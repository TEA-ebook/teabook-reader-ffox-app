/*global define: true, navigator: true*/
define("collection/rebooks", ["backbone", "database", "model/ebook"], function (Backbone, database, EbookModel) {
    "use strict";

    var RebookCollection = Backbone.Collection.extend({

        model: EbookModel,

        database: database,
        storeName: "ebooks"

    });

    return RebookCollection;
});