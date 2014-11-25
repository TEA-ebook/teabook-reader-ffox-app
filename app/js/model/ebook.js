/*global define*/
define("model/ebook", ["backbone", "database"], function (Backbone, database) {
    "use strict";

    var EbookModel = Backbone.Model.extend({
        database: database,
        storeName: "ebooks"
    });

    return EbookModel;
});