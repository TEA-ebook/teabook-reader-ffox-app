/*global define, DOMParser*/
define("model/book-toc-item", ["backbone"], function (Backbone) {
    "use strict";

    var BookTocItemModel = Backbone.Model.extend({

        defaults: {
            label: "",
            href: "",
            items: [],
            level: 1,
            endPoint: true,
            current: false
        },

        initialize: function () {
            this.set('items', []);
            this.on('change:items', this.computeEndPoint.bind(this));
        },

        computeEndPoint: function () {
            this.set({ endPoint: this.get('items').length === 0 }, { silent: true });
        },

        getTotalEndPoints: function () {
            var items = this.get("items");
            if (items.length > 0) {
                return items.reduce(function (sum, item) {
                    return item.getTotalEndPoints() + sum;
                }, 0);
            }
            return 1;
        },

        getItem: function (href) {
            if (this.get('href').startsWith(href)) {
                return this;
            }

            var i, items, item;
            items = this.get('items');
            for (i = 0; i < items.length; i += 1) {
                item = items[i].getItem(href);
                if (item) {
                    return item;
                }
            }
            return false;
        }
    });

    return BookTocItemModel;
});