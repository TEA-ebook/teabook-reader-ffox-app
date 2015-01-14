/*global define*/
define('route/bookcase', ['jquery', 'collection/books', 'view/bookcase/index', 'view/bookcase/drawer'],
    function ($, BookCollection, BookcaseView, DrawerView) {
        "use strict";
        return function () {
            console.info("route to bookcase");

            var bookcaseView, drawerView;

            bookcaseView = new BookcaseView({ collection: new BookCollection() });
            $("#content").html(bookcaseView.el);

            drawerView = new DrawerView();
            drawerView.render();
            $("#content").append(drawerView.el);
        };
    });