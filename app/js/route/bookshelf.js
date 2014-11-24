/*global define: true*/
define('route/bookshelf', ['jquery', 'collection/rebooks', 'view/bookshelf/index'],
    function ($, RebookCollection, BookshelfView) {
        "use strict";
        return function () {
            console.info("route to bookshelf");

            var view = new BookshelfView({ collection: new RebookCollection() });
            $("#content").html(view.el);
        };
    });