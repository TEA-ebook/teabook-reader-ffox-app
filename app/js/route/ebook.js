/*global define, window, Teavents*/
define('route/ebook', ['jquery', 'backbone', 'model/ebook', 'view/ebook/index'],
    function ($, Backbone, EbookModel, EbookView) {
        "use strict";

        return function (hash, chapter, cfi) {
            var contentEl = $("#content"),
                ebook,
                view;

            console.info("route to ebook " + hash);
            if (chapter) {
                console.info("and chapter " + window.decodeURIComponent(chapter));
                if (cfi) {
                    console.info("and CFI " + window.decodeURIComponent(cfi));
                }
            }

            if (contentEl.find("iframe").length > 0) {
                if (cfi) {
                    Backbone.trigger(Teavents.Actions.OPEN_POSITION, chapter, cfi);
                } else {
                    Backbone.trigger(Teavents.Actions.OPEN_CHAPTER, chapter);
                }
            } else {
                ebook = new EbookModel({
                    hash: hash
                });

                view = new EbookView({
                    model: ebook,
                    chapter: chapter ? window.decodeURIComponent(chapter) : null
                });

                // and render
                contentEl.html(view.el);
            }
        };
    });