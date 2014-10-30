/*global define: true*/
define('route/ebook-chapter',
    function () {
        "use strict";

        return function (uri, chapter) {
            console.info("route to ebook " + uri + " and chapter " + chapter);
        };
    });