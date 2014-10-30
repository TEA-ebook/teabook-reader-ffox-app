/*global define: true, DOMParser: true*/
define("model/ebook-toc", ["backbone"], function (Backbone) {
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
            Array.prototype.forEach.call(tocDom.querySelectorAll("navPoint"), function (navPoint) {
                this.get("items").push({
                    text: navPoint.querySelector("navLabel").textContent.trim(),
                    content: navPoint.querySelector("content").getAttribute("src").trim()
                });
            }.bind(this));
        }
    });

    return EbookTocModel;
});