/*global define, window*/
define('view/ebook/bookmark', ['backbone', 'template/ebook/bookmark'],
    function (Backbone, template) {
        "use strict";

        var BookmarkView = Backbone.View.extend({

            tagName: 'li',
            className: 'ebook-bookmark',

            render: function (uri) {
                var attributes = this.model.attributes;
                attributes.uri = "#/ebook/" + uri + "/" + window.encodeURIComponent(attributes.idref) + "/" + window.encodeURIComponent(attributes.cfi);
                this.$el.html(template(attributes));
                return this;
            }
        });

        return BookmarkView;
    });