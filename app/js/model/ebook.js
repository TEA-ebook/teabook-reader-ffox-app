/*global define*/
define("model/ebook", ["backbone", "database"], function (Backbone, database) {
    "use strict";

    var EbookModel = Backbone.Model.extend({
        database: database,
        storeName: "ebooks",

        defaults: {
            fontSize: 120,
            theme: "author"
        },

        initialize: function () {
            this.on("change:path", this.computeHash, this);
        },

        computeHash: function () {
            this.set({ hash: this.get('path').hashCode() }, { silent: true });
        }
    });

    return EbookModel;
});