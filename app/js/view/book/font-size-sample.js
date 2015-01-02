/*global define, Teavents*/
define('view/book/font-size-sample', ['backbone'],
    function (Backbone) {
        "use strict";

        var FontSizeSampleView = Backbone.View.extend({

            className: "book-font-size-sample",

            initialize: function () {
                Backbone.on(Teavents.Readium.GESTURE_PINCH_MOVE, this.scale.bind(this));
                Backbone.on(Teavents.Readium.GESTURE_PINCH, this.hide.bind(this));
            },

            render: function () {
                this.$el.html("<div>Abc</div>");
            },

            /**
             * Stretch font size sample
             *
             * @param data
             */
            scale: function (data) {
                var cssValues;
                cssValues = {
                    "font-size": data.fontSize + "%"
                };
                if (this.$el.css("display") === "none") {
                    cssValues.top = (data.center.y - (this.fontSample.height() / 2)) + "px";
                    cssValues.left = (data.center.x - (this.fontSample.width() / 2)) + "px";
                    this.$el.show();
                }
                this.$el.css(cssValues);
            },

            hide: function () {
                this.$el.hide();
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.PINCH);
            },

            close: function () {
                Backbone.off(Teavents.Readium.GESTURE_PINCH_MOVE);
                Backbone.off(Teavents.Readium.GESTURE_PINCH);
                this.remove();
            }
        });

        return FontSizeSampleView;
    });