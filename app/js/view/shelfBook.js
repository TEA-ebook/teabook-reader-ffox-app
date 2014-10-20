define('view/shelfBook', ['backbone', 'template/shelfBook'], function (Backbone, shelfBookTemplate) {

    var ShelfBookView = Backbone.View.extend({

        tagName: "div",
        className: "ebook",

        events: {
            "click": "open"
        },

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.appendChild(shelfBookTemplate(this.model.attributes));
        },

        open: function (event) {
            console.log(event);
        }

    });

    return ShelfBookView;
});