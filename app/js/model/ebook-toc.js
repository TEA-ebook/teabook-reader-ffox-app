/*global define: true, DOMParser: true*/
define("model/ebook-toc", ["backbone", "model/ebook-toc-item"], function (Backbone, TocItemModel) {
    "use strict";

    var EbookTocModel = Backbone.Model.extend({

        defaults: {
            items: []
        },

        initialize: function () {
            this.set("items", []);
        },

        load: function (xml) {
            var tocDom = (new DOMParser()).parseFromString(xml, "text/xml");
            this.set("items", this.parseNavPoint(tocDom.querySelector("navPoint"), []));
        },

        parseNavPoint: function (navPoint, items) {
            var item, navPointChild;

            item = new TocItemModel({
                label: navPoint.querySelector("navLabel").textContent.trim(),
                href: navPoint.querySelector("content").getAttribute("src").trim()
            });

            navPointChild = navPoint.querySelector("navPoint");
            if (navPointChild) {
                item.set("items", this.parseNavPoint(navPointChild, []));
            }

            items.push(item);

            // next nav point
            if (navPoint.nextElementSibling) {
                this.parseNavPoint(navPoint.nextElementSibling, items);
            }

            return items;
        }
    });

    return EbookTocModel;
});