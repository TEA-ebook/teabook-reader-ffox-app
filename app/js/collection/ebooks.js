/*global define: true, navigator: true*/
define("collection/ebooks", ["backbone", "database", "model/ebook"], function (Backbone, database, EbookModel) {
    "use strict";

    var EbookCollection = Backbone.Collection.extend({

        model: EbookModel,

        database: database,
        storeName: "ebooks"

    });

    return EbookCollection;
});