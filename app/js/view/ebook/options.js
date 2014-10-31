/*global define: true*/
define('view/ebook/options', ['backbone', 'template/ebook/options'],
    function (Backbone, template) {
        "use strict";

        var EbookOptionsView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-options hidden',

            events: {
                "click button.increase-font-size": "increaseFontSize",
                "click button.decrease-font-size": "decreaseFontSize"
            },

            render: function () {
                this.$el.html(template());
                return this;
            },

            increaseFontSize: function () {
                Backbone.trigger("font-size:increase");
            },

            decreaseFontSize: function () {
                Backbone.trigger("font-size:decrease");
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    this.show();
                } else {
                    this.hide();
                }
            },

            show: function () {
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                return false;
            }
        });

        return EbookOptionsView;
    });