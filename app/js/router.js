/*global define: true, window: true*/
define('router', ['backbone', 'helper/domEvents', 'route/bookshelf', 'route/ebook', 'route/ebook-chapter'],
    function (Backbone, DomEvents, bookshelfRoute, ebookRoute, ebookChapterRoute) {
        "use strict";

        var AppRouter = Backbone.Router.extend({

            initialize: function () {
                DomEvents.initialize();
                Backbone.history.start({ pushState: false, root: "/" });
            },

            routes: {
                '': bookshelfRoute,
                'ebook/:uri': ebookRoute,
                'ebook/:uri/:chapter': ebookChapterRoute
            }
        });

        return new AppRouter();
    });