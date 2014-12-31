/*global define, window, Teavents*/
define('view/no-connection', ['backbone', 'template/no-connection'],

    function (Backbone, template) {
        "use strict";

        var NoConnectionView = Backbone.View.extend({

            tagName: "div",
            className: "warning",

            events: {
                "click .bar": "backToBookcase",
                "click strong": "openSettings"
            },

            render: function () {
                this.$el.html(template());
                window.document.l10n.localizeNode(this.el);
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.NO_CONNECTION);
            },

            backToBookcase: function () {
                Backbone.history.navigate("/", true);
            },

            openSettings: function () {
                if (window.MozActivity) {
                    var settings = new window.MozActivity({
                        name: "configure",
                        data: {
                            target: "device"
                        }
                    });

                    settings.onsuccess = function () {
                        this.backToBookcase();
                    }.bind(this);

                    Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_SETTINGS);
                } else {
                    console.info("You are not in a Firefox OS phone or in a Firefox OS simulator.");
                }
            }
        });

        return NoConnectionView;
    });