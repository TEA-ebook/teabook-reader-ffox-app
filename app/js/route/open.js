/*global define*/
define('route/open', ['jquery', 'template/waiting'],
    function ($, template) {
        "use strict";

        return function () {
            var contentEl = $("#content");

            console.info("route to open");
            contentEl.html(template());
        };
    });