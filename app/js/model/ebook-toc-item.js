/*global define: true, DOMParser: true*/
define("model/ebook-toc-item", ["backbone"], function (Backbone) {
    "use strict";

    var EbookTocItemModel = Backbone.Model.extend({

        defaults: {
            label: "",
            href: "",
            items: [],
            endPoint: true
        },

        initialize: function () {
            this.set('items', []);
        },

        addItem: function (item) {
            this.get("items").push(item);
            this.set("endPoint", false);
        }
    });

    return EbookTocItemModel;
});