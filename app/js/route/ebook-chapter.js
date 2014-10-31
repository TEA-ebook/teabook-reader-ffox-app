/*global define: true*/
define('route/ebook-chapter', ['backbone'],
    function (Backbone) {
        "use strict";

        return function (uri, chapter) {
            console.info("route to ebook " + uri + " and chapter " + chapter);
            Backbone.trigger("ebook:chapter", chapter);
        };
    });