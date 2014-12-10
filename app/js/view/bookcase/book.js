/*global define, window, Uint8Array, Blob*/
define('view/bookcase/book', ['backbone', 'helper/device', 'template/bookcase/book'],
    function (Backbone, Device, bookTemplate) {
        "use strict";

        var BookView = Backbone.View.extend({

            tagName: "div",
            className: "book",

            events: {
                "click": "open"
            },

            initialize: function () {
                this.listenToOnce(Backbone, 'destroy', this.close.bind(this));
                this.model.on('change', this.render, this);
                this.model.on('destroy', this.close, this);
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

            open: function (event) {
                if (this.model.get("selection")) {
                    this.toggleSelection(event);
                } else {
                    this.ell.classList.add("open");
                    setTimeout(function () {
                        Backbone.history.navigate("book/" + this.model.get("hash"), true);
                    }.bind(this), 200);
                }
            },

            toggleSelection: function (event) {
                event.preventDefault();
                event.stopImmediatePropagation();

                var checkbox = this.ell.querySelector("input[type=checkbox]"),
                    selected = !checkbox.getAttribute("checked");

                if (selected) {
                    checkbox.setAttribute("checked", "checked");
                } else {
                    checkbox.removeAttribute("checked");
                }

                this.model.set({ "selected": selected }, { "silent": true });
            },

            close: function () {
                this.remove();
            }
        });

        return BookView;
    });