define('view/shelf', ['backbone', 'collection/ebooks', 'view/shelfBook', 'template/shelf'],
    function (Backbone, EbookCollection, ShelfBookView, shelfTemplate) {

        var ShelfView = Backbone.View.extend({

                el: "#content",

                initialize: function () {
                    this.collection.on("reset", this.render, this);
                    this.collection.fetch();
                },

                render: function () {
                    this.$el.html(shelfTemplate());
                    this.collection.each(this.renderEbook, this);
                },

                renderEbook: function (model) {
                    new ShelfBookView({
                        "el": this.el,
                        "model": model
                    });
                    console.debug("render ebook");
                }
            }
        );
        return ShelfView;
    }
);