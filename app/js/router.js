define('router', ['backbone', 'collection/ebooks', 'view/shelf'], function (Backbone, EbookCollection, ShelfView) {
    "use strict";

    var AppRouter = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start({ pushState: false, root: "/" });
        },

        routes: {
            '': 'bookShelf',
            'test': 'test'
        },

        bookShelf: function() {
            console.debug("shelf route activated");
            new ShelfView({ collection: new EbookCollection() });
        },

        test: function() {
            console.debug("Test route activated");
        }
    });

    return AppRouter;
});