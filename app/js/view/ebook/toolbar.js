/*global define, Teavents*/
define('view/ebook/toolbar', ['backbone', 'template/ebook/toolbar'],
    function (Backbone, template) {
        "use strict";

        var EbookToolbarView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-toolbar',

            events: {
                "click button.bookmark": "bookmarkPage"
            },

            render: function () {
                this.$el.html(template());
                return this;
            },

            bookmarkPage: function (event) {
                this.$(event.currentTarget).addClass("on");
                Backbone.trigger(Teavents.Actions.BOOKMARK_PAGE);
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

        return EbookToolbarView;
    });