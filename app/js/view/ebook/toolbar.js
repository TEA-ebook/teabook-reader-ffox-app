/*global define: true*/
define('view/ebook/toolbar', ['backbone', 'template/ebook/toolbar'],
    function (Backbone, template) {
        "use strict";

        var EbookToolbarView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-toolbar',

            render: function () {
                this.$el.html(template());
                return this;
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    return this.display();
                }
                return this.hide();
            },

            display: function () {
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                return false;
            }
        });

        return EbookToolbarView;
    });