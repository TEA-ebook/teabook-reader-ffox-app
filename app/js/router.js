/*global define, window*/
define('router', ['backbone', 'helper/dom-events', 'route/bookcase', 'route/book', 'route/open'],
    function (Backbone, DomEvents, bookcaseRoute, bookRoute, openRoute) {
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
                '': bookcaseRoute,
                'open': openRoute,
                'book/:hash': bookRoute,
                'book/:hash/:chapter': bookRoute,
                'book/:hash/:idref/:cfi': bookRoute
            }
        });

        return new AppRouter();
    });