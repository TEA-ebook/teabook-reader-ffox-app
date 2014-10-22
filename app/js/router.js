/*global define: true*/
define('router', ['backbone', 'route/bookshelf', 'route/ebook'],
    function (Backbone, bookshelfRoute, ebookRoute) {
        "use strict";

        var AppRouter = Backbone.Router.extend({

            initialize: function () {
                Backbone.history.start({ pushState: false, root: "/" });
            },

            routes: {
                '': bookshelfRoute,
                'ebook/:uri': ebookRoute
            }
        });

        return new AppRouter();
    });