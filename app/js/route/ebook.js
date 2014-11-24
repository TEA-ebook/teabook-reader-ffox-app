/*global define: true, window: true, Teavents: true*/
define('route/ebook', ['jquery', 'backbone', 'model/ebook', 'view/ebook/index'],
    function ($, Backbone, EbookModel, EbookView) {
        "use strict";

        return function (uri, chapter) {
            var contentEl = $("#content"),
                ebook,
                view;

            console.info("route to ebook " + window.decodeURIComponent(uri));
            if (chapter) {
                console.info("and chapter " + window.decodeURIComponent(chapter));
            }

            if (contentEl.find("iframe").length > 0) {
                Backbone.trigger(Teavents.Actions.OPEN_CHAPTER, chapter);
            } else {
                ebook = new EbookModel({
                    path: window.decodeURIComponent(uri),
                    chapter: chapter ? window.decodeURIComponent(chapter) : null
                });

                view = new EbookView({
                    model: ebook
                });

                // and render
                contentEl.html(view.el);
            }
        };
    });