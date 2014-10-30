/*global define: true, window: true*/
define('view/bookshelf/book', ['backbone', 'template/bookshelf/book'],
    function (Backbone, bookTemplate) {
        "use strict";

        var BookView = Backbone.View.extend({

            tagName: "div",
            className: "ebook",

            events: {
                "click": "open"
            },

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.remove.bind(this));
                this.render();
                this.ell = this.$el[0];
            },

            render: function () {
                this.$el.html(bookTemplate(this.model.attributes));
                return this;
            },

            open: function () {
                this.ell.classList.add("open");
                setTimeout(function () {
                    Backbone.history.navigate("ebook/" + window.encodeURIComponent(this.model.get("name")), true);
                }.bind(this), 300);
            }
        });

        return BookView;
    });