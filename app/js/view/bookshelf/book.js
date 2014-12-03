/*global define, window, Uint8Array, Blob*/
define('view/bookshelf/book', ['backbone', 'helper/device', 'template/bookshelf/book'],
    function (Backbone, Device, bookTemplate) {
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
                var attributes = this.model.attributes;

                if (!this.model.has('coverUrl') && this.model.has('cover')) {
                    Device.readFile(this.model.get("cover"), function (file) {
                        attributes.coverUrl = window.URL.createObjectURL(file);
                        this.$el.html(bookTemplate(attributes));
                    }.bind(this));
                } else {
                    this.$el.html(bookTemplate(attributes));
                }
            },

            open: function () {
                this.ell.classList.add("open");
                setTimeout(function () {
                    Backbone.history.navigate("ebook/" + this.model.get("hash"), true);
                }.bind(this), 200);
            },

            close: function () {
                this.remove();
            }
        });

        return BookView;
    });