/*global define, Teavents*/
define('view/book/toolbar', ['backbone', 'template/book/toolbar'],
    function (Backbone, template) {
        "use strict";

        var BookToolbarView = Backbone.View.extend({

            tagName: 'div',
            className: 'bar toolbar hidden',

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
                return false;
            }
        });

        return BookToolbarView;
    });