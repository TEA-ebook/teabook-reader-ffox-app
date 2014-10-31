/*global define: true, window: true*/
define('view/ebook/toc', ['backbone', 'template/ebook/toc'],
    function (Backbone, template) {
        "use strict";

        var EbookTocView = Backbone.View.extend({

            tagName: 'ul',

            initialize: function (options) {
                this.uri = options.uri;
            },

            render: function () {
                this.$el.html(template({
                    model: this.model.attributes,
                    uri: window.encodeURIComponent(this.uri)
                }));
                return this;
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

        return EbookTocView;
    });