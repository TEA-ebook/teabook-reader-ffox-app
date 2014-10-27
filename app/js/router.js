/*global define: true, window: true*/
define('router', ['backbone', 'helper/domEvents', 'route/bookshelf', 'route/ebook'],
    function (Backbone, DomEvents, bookshelfRoute, ebookRoute) {
        "use strict";

        var AppRouter = Backbone.Router.extend({

            initialize: function () {
                DomEvents.initialize();
                Backbone.history.start({ pushState: false, root: "/" });
            },

            routes: {
                '': bookshelfRoute,
                'ebook/:uri': ebookRoute
            }
        });

        return new AppRouter();
    });