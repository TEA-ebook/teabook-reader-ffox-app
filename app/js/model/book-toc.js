/*global define, DOMParser, window*/
define("model/book-toc", ["backbone", "model/book-toc-item"], function (Backbone, TocItemModel) {
    "use strict";

    var BookTocModel = Backbone.Model.extend({

        defaults: {
            items: []
        },

        initialize: function () {
            this.set("items", []);
        },

        load: function (xml) {
            var tocDom, items;

            tocDom = (new DOMParser()).parseFromString(xml, "text/xml");
            items = this.parseNavPoint(tocDom.querySelector("navPoint"), []);

            this.setPositions(items, 1, 0);
            this.set("items", items);
            if (items.length > 0) {
                this.currentItem = items[0];
            }
        },

        parseNavPoint: function (navPoint, items, parent) {
            var item, navPointChild, navLabel;

            navLabel = navPoint.querySelector("navLabel");
            if (navLabel) {
                item = new TocItemModel({
                    label: navLabel.textContent.trim(),
                    href: navPoint.querySelector("content").getAttribute("src").trim(),
                    parent: parent ? { href: parent.get('href'), label: parent.get('label')} : false
                });

                // parsing first child and its siblings
                navPointChild = navPoint.querySelector("navPoint");
                if (navPointChild) {
                    item.set("items", this.parseNavPoint(navPointChild, [], item));
                }

                items.push(item);
            }

            // next nav point
            if (navPoint.nextElementSibling) {
                this.parseNavPoint(navPoint.nextElementSibling, items, parent);
            }

            return items;
        },

        getTotalEndPoints: function () {
            return this.get('items').reduce(function (sum, item) {
                return item.getTotalEndPoints() + sum;
            }, 0);
        },

        setPositions: function (items, level, endpoints) {
            var item, i = 0;
            for (i; i < items.length; i += 1) {
                item = items[i];
                item.set('level', level);
                if (item.get('endPoint')) {
                    endpoints += 1;
                    item.set('position', endpoints);
                } else {
                    endpoints = this.setPositions(item.get('items'), level + 1, endpoints);
                }
            }
            return endpoints;
        },

        getItem: function (href) {
            var items, i, item;
            items = this.get('items');
            for (i = 0; i < items.length; i += 1) {
                item = items[i].getItem(href);
                if (item) {
                    return item;
                }
            }
            return false;
        },

        getItemPosition: function (href) {
            var item = this.getItem(href);
            return item ? item.get("position") : false;
        },

        getCurrentItem: function () {
            return this.currentItem;
        },

        setCurrentItem: function (item) {
            this.removeCurrent(this.get('items'), item);
            this.currentItem = item;
            item.set("current", true);
        },

        getFirstItem: function () {
            return this.get('items')[0];
        },

        removeCurrent: function (items, currentItem) {
            var item, i = 0;
            for (i; i < items.length; i += 1) {
                item = items[i];
                if (item.get('current') && item.get('href') !== currentItem.get('href')) {
                    item.set('current', false);
                }
                this.removeCurrent(item.get('items'), currentItem);
            }
            return;
        }
    });

    return BookTocModel;
});