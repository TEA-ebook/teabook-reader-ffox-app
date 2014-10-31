/*global define: true, window: true*/
define('view/ebook/toc', ['backbone', 'template/ebook/toc'],
    function (Backbone, tocTemplate) {
        "use strict";

        var EbookTocView = Backbone.View.extend({

            tagName: 'ul',

            initialize: function (options) {
                this.uri = options.uri;
            },

            render: function () {
                this.$el.html(tocTemplate({
                    model: this.model.attributes,
                    uri: window.encodeURIComponent(this.uri)
                }));
                return this;
            }
        });

        return EbookTocView;
    });