/*global define, window, Uint8Array, Blob*/
define('view/bookcase/book', ['backbone', 'helper/device', 'template/bookcase/book'],
    function (Backbone, Device, template) {
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
                if (!this.model.has('uuid')) {
                    this.$el.addClass('loading');
                } else {
                    this.$el.removeClass('loading');
                }

                if (!this.model.has('coverUrl') && this.model.has('cover')) {
                    Device.readFile(this.model.get("cover"), function (file) {
                        if (file) {
                            this.model.set('coverUrl', window.URL.createObjectURL(file));
                        }
                        this.$el.html(template(this.model.attributes));
                    }.bind(this));
                } else {
                    this.$el.html(template(this.model.attributes));
                }
            },

            open: function (event) {
                if (this.model.get("selection")) {
                    this.toggleSelection(event);
                } else {
                    this.ell.classList.add("open");
                    setTimeout(function () {
                        Backbone.history.navigate("book/" + this.model.get("hash"), true);
                    }.bind(this), 300);
                }
            },

            toggleSelection: function (event) {
                event.preventDefault();

                var checkbox = this.ell.querySelector("input[type=checkbox]"), selected;
                if (checkbox) {
                    selected = !checkbox.getAttribute("checked");

                    if (selected) {
                        checkbox.setAttribute("checked", "checked");
                    } else {
                        checkbox.removeAttribute("checked");
                    }
                }

                this.model.set({ "selected": selected }, { "silent": true });
            },

            close: function () {
                this.remove();
            }
        });

        return BookView;
    });