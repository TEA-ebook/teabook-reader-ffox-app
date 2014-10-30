/*global define: true, window: true*/
define('route/ebook', ['jquery', 'model/ebook', 'view/ebook/index'],
    function ($, EbookModel, EbookView) {
        "use strict";

        var view = null;

        return function (uri) {
            console.info("route to ebook " + window.decodeURIComponent(uri));

            var ebook = new EbookModel({
                id: 0,
                name: window.decodeURIComponent(uri)
            });

            if (view === null) {
                view = new EbookView({
                    model: ebook
                });
            } else {
                view.model = ebook;
            }

            // and render
            $("#content").html(view.el);
        };
    });