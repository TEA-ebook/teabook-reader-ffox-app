/*global define*/
define("model/book", ["backbone", "database"], function (Backbone, database) {
    "use strict";

    var BookModel = Backbone.Model.extend({
        database: database,
        storeName: "books",

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

    return BookModel;
});