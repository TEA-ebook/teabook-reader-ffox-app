/*global define: true*/
define('route/bookshelf', ['jquery', 'collection/ebooks', 'view/bookshelf/index'],
    function ($, EbookCollection, BookshelfView) {
        "use strict";
        return function () {
            console.info("route to bookshelf");

            var view = new BookshelfView({ collection: new EbookCollection() });
            $("#content").html(view.el);
        };
    });