/*global define, Teavents*/
define('view/book/toolbar', ['backbone', 'template/book/toolbar'],
    function (Backbone, template) {
        "use strict";

        var BookToolbarView = Backbone.View.extend({

            tagName: 'div',
            className: 'bar toolbar',

            events: {
                "click button": "highlightButton"
            },

            render: function () {
                this.$el.html(template());
                return this;
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    return this.show();
                }
                return this.hide();
            },

            show: function () {
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                this.clearHighlight();
                return false;
            },

            highlightButton: function (event) {
                var button = event.currentTarget;
                if (button.classList.contains("active")) {
                    button.classList.remove("active");
                } else {
                    button.classList.add("active");
                }
            },

            clearHighlight: function () {
                this.$el.find("button.active").removeClass("active");
            }
        });

        return BookToolbarView;
    });