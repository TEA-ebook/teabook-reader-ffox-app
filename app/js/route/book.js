/*global define, window, Teavents*/
define('route/book', ['jquery', 'backbone', 'model/book', 'view/book/index'],
    function ($, Backbone, BookModel, BookView) {
        "use strict";

        return function (hash, chapter, cfi) {
            var contentEl = $("#content"),
                book,
                view;

            if (contentEl.find("iframe").length > 0) {
                if (cfi) {
                    Backbone.trigger(Teavents.Actions.OPEN_POSITION, chapter, cfi);
                } else {
                    Backbone.trigger(Teavents.Actions.OPEN_CHAPTER, chapter);
                }
            } else {
                book = new BookModel({
                    hash: hash
                });

                view = new BookView({
                    model: book,
                    pageRequest: {
                        chapter: chapter ? window.decodeURIComponent(chapter) : null,
                        cfi: cfi ? window.decodeURIComponent(cfi) : null
                    }
                });

                // and render
                contentEl.html(view.el);
            }
        };
    });