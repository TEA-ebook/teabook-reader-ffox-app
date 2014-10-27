/*global define: true, window: true*/
define('route/ebook', ['jquery', 'model/ebook', 'view/ebook'],
    function ($, EbookModel, EbookView) {
        "use strict";

        var view = null;

        return function (uri) {
            console.info("route to ebook " + window.decodeURIComponent(uri));

            view = new EbookView({
                model: new EbookModel({
                    id: 0,
                    name: window.decodeURIComponent(uri)
                })
            });

            // be sure to be at the top
            $('html,body').scrollTop(0);

            // and render
            $("#content").html(view.el);
        };
    });