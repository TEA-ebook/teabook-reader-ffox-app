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
            var tocDom, items, navEntryPoint;

            tocDom = (new DOMParser()).parseFromString(xml, "text/xml");

            navEntryPoint = tocDom.querySelector("navMap");
            if (navEntryPoint) {
                // ePub 2
                items = this.parseNavItem(tocDom.querySelector("navPoint"), "navPoint", []);
            } else {
                // ePub 3
                items = this.parseNavItem(tocDom.querySelector("li"), "li", []);
            }

            this.set("items", items);
            if (items.length > 0) {
                this.setPositions(items, 1, 0);
                this.currentItem = items[0];
            }
        },

        parseNavPoint: function (navPoint, items, parent) {
            return this.parseNavItem(navPoint, "navPoint", items, parent);
        },

        parseLi: function (li, items, parent) {
            return this.parseNavItem(li, "li", items, parent);
        },

        parseNavItem: function (item, tagName, items, parent) {
            var tocItem, childItem;

            if (!item) {
                return [];
            }

            if (item.hasChildNodes()) {
                tocItem = new TocItemModel(tagName === "li" ? this.extractNavLiInfos(item, parent) : this.extractNavPointInfos(item, parent));

                // parsing first child and its siblings
                childItem = item.querySelector(tagName);
                if (childItem) {
                    tocItem.set("items", this.parseNavItem(childItem, tagName, [], tocItem));
                }

                items.push(tocItem);
            }

            // next nav item
            if (item.nextElementSibling) {
                this.parseNavItem(item.nextElementSibling, tagName, items, parent);
            }

            return items;
        },

        extractNavPointInfos: function (item, parent) {
            var navLabel = item.querySelector("navLabel");
            return {
                label: navLabel ? navLabel.textContent.trim() : item.getAttribute("id"),
                href: item.querySelector("content").getAttribute("src").trim(),
                parent: parent ? { href: parent.get('href'), label: parent.get('label')} : false
            };
        },

        extractNavLiInfos: function (item, parent) {
            var link = item.querySelector("a");
            return {
                label: link.textContent.trim(),
                href: link.getAttribute("href").trim(),
                parent: parent ? { href: parent.get('href'), label: parent.get('label')} : false
            };
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
            item.set('current', true);
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
        },

        hasItems: function () {
            return this.get('items').length > 0;
        }
    });

    return BookTocModel;
});