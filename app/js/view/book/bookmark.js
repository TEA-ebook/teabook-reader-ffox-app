/*global define, window*/
define('view/book/bookmark', ['backbone', 'template/book/bookmark'],
    function (Backbone, template) {
        "use strict";

        var BookmarkView = Backbone.View.extend({

            tagName: 'li',
            className: 'ebook-bookmark',

            events: {
                "click button": "deleteBookmark"
            },

            initialize: function () {
                this.model.on("destroy", this.remove, this);
            },

            render: function (hash) {
                var attributes = this.model.attributes;
                attributes.uri = "#/book/" + hash + "/" + window.encodeURIComponent(attributes.idref) + "/" + window.encodeURIComponent(attributes.cfi);

                this.$el.attr('data-rank', this.model.get('rank'));
                this.$el.html(template(attributes));

                window.document.l10n.localizeNode(this.el);

                return this;
            },

            deleteBookmark: function (event) {
                event.stopImmediatePropagation();
                this.model.destroy();
            }
        });

        return BookmarkView;
    });