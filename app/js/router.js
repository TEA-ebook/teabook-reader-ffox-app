/*global define, window, Teavents*/
define('router', ['backbone', 'helper/dom-events', 'helper/logger', 'route/bookcase', 'route/book', 'route/open', 'route/no-connection'],
    function (Backbone, DomEvents, Logger, bookcaseRoute, bookRoute, openRoute, noConnectionRoute) {
        "use strict";

        var AppRouter = Backbone.Router.extend({

            initialize: function () {
                DomEvents.initialize();

                // Wait for l20n initialization before any templating
                window.document.l10n.ready(function () {
                    Backbone.history.start({ pushState: false, root: "/" });
                    Backbone.on(Teavents.Actions.LOG, Logger.log);
                    Logger.startApp();
                });
            },

            routes: {
                '': bookcaseRoute,
                'open': openRoute,
                'noconnection': noConnectionRoute,
                'book/:hash': bookRoute,
                'book/:hash/:chapter': bookRoute,
                'book/:hash/:idref/:cfi': bookRoute
            }
        });

        return new AppRouter();
    });