/*global define, window*/
define('router', ['backbone', 'helper/dom-events', 'route/bookshelf', 'route/ebook'],
    function (Backbone, DomEvents, bookshelfRoute, ebookRoute) {
        "use strict";

        var AppRouter = Backbone.Router.extend({

            initialize: function () {
                DomEvents.initialize();

                // Wait for l20n initialization before any templating
                window.document.l10n.ready(function () {
                    Backbone.history.start({ pushState: false, root: "/" });
                });
            },

            routes: {
                '': bookshelfRoute,
                'ebook/:uri': ebookRoute,
                'ebook/:uri/:chapter': ebookRoute
            }
        });

        return new AppRouter();
    });