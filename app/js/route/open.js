/*global define*/
define('route/open', ['jquery', 'template/waiting'],
    function ($, template) {
        "use strict";

        return function () {
            var contentEl = $("#content");
            contentEl.html(template());
        };
    });