/*global define: true*/
define('view/ebook/toolbar', ['backbone', 'template/ebook/toolbar'],
    function (Backbone, toolbarTemplate) {
        "use strict";

        var EbookToolbarView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-toolbar',

            render: function () {
                this.$el.html(toolbarTemplate());
            }
        });

        return EbookToolbarView;
    });