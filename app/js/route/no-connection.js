/*global define, window*/
define('route/no-connection', ['jquery', 'view/no-connection'],
    function ($, NoConnectionView) {
        "use strict";

        return function () {
            var contentEl = $("#content"),
                view = new NoConnectionView();

            console.info("route to no-connection");

            view.render();
            contentEl.html(view.el);
        };
    });