/*global define: true*/
define('view/ebook/toc', ['backbone', 'template/ebook/toc'],
    function (Backbone, tocTemplate) {
        "use strict";

        var EbookTocView = Backbone.View.extend({

            tagName: 'ul',

            events: {
                "click": "goToChapter"
            },

            initialize: function (options) {
                this.uri = options.uri;
            },

            render: function () {
                this.$el.html(tocTemplate({
                    model: this.model.attributes,
                    uri: this.uri
                }));
            },

            goToChapter: function (event) {
                console.debug("gotcha");

                event.originalEvent.stopImmediatePropagation();
                return false;
            }
        });

        return EbookTocView;
    });