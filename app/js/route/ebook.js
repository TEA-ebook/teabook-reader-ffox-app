/*global define: true, window: true*/
define('route/ebook', ['jquery', 'model/ebook', 'view/ebook/index'],
    function ($, EbookModel, EbookView) {
        "use strict";

        return function (uri, chapter) {
            console.info("route to ebook " + window.decodeURIComponent(uri));
            if (chapter) {
                console.info("and chapter " + window.decodeURIComponent(chapter));
            }

            var ebook, view;

            ebook = new EbookModel({
                id: 0,
                name: window.decodeURIComponent(uri),
                chapter: chapter ? window.decodeURIComponent(chapter) : null
            });

            view = new EbookView({
                model: ebook
            });

            // and render
            $("#content").html(view.el);
        };
    });