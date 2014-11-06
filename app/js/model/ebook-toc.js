/*global define: true, DOMParser: true, window: true*/
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
            this.set("items", this.parseNavPoint(tocDom.querySelector("navPoint"), [], 0));
        },

        parseNavPoint: function (navPoint, items, endPoints) {
            var item, navPointChild, navLabel;

            navLabel = navPoint.querySelector("navLabel");
            if(navLabel) {
                item = new TocItemModel({
                    label: navLabel.textContent.trim(),
                    href: navPoint.querySelector("content").getAttribute("src").trim()
                });

                // parsing first child and its siblings
                navPointChild = navPoint.querySelector("navPoint");
                if (navPointChild) {
                    item.set("items", this.parseNavPoint(navPointChild, [], endPoints));
                } else {
                    endPoints += 1;
                    item.set('position', endPoints);
                }

                items.push(item);
            }

            // next nav point
            if (navPoint.nextElementSibling) {
                this.parseNavPoint(navPoint.nextElementSibling, items, endPoints);
            }

            return items;
        },

        getTotalEndPoints: function () {
            return this.get('items').reduce(function (sum, item) {
                return item.getTotalEndPoints() + sum;
            }, 0);
        },

        getItemPosition: function (href) {
            var items, i, position;
            items = this.get('items');
            for (i = 0; i < items.length; i += 1) {
                position = items[i].getItemPosition(href);
                if (position) {
                    return position;
                }
            }
            return false;
        }
    });

    return EbookTocModel;
});