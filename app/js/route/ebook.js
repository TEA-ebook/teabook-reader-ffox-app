/*global define: true, window: true*/
define('route/ebook', ['jquery', 'model/ebook', 'view/ebook/index'],
    function ($, EbookModel, EbookView) {
        "use strict";

        return function (uri) {
            console.info("route to ebook " + window.decodeURIComponent(uri));

            var ebook, view;

            ebook = new EbookModel({
                id: 0,
                name: window.decodeURIComponent(uri)
            });

            view = new EbookView({
                model: ebook
            });

            // and render
            $("#content").html(view.el);
        };
    });