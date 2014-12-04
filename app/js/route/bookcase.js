/*global define*/
define('route/bookcase', ['jquery', 'collection/books', 'view/bookcase/index'],
    function ($, BookCollection, BookcaseView) {
        "use strict";
        return function () {
            console.info("route to bookcase");

            var view = new BookcaseView({ collection: new BookCollection() });
            $("#content").html(view.el);
        };
    });