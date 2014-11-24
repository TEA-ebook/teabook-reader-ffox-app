/*global define: true, window: true, Uint8Array: true, Blob: true*/
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
                this.listenToOnce(Backbone, 'destroy', this.close.bind(this));
                this.model.on('change', this.render, this);
                this.render();
                this.ell = this.$el[0];
            },

            render: function () {
                var blob, attributes;

                attributes = this.model.attributes;

                if (this.model.has('cover')) {
                    blob = new Blob([new Uint8Array(this.model.get("cover"))], { type: "image/jpeg" });
                    attributes.coverUrl = window.URL.createObjectURL(blob);
                }

                this.$el.html(bookTemplate(attributes));
            },

            open: function () {
                this.ell.classList.add("open");
                setTimeout(function () {
                    Backbone.history.navigate("ebook/" + window.encodeURIComponent(this.model.get("path")), true);
                }.bind(this), 200);
            },

            close: function () {
                this.remove();
            }
        });

        return BookView;
    });