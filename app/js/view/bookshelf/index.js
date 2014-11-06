/*global define: true*/
define('view/bookshelf/index', ['backbone', 'view/bookshelf/book', 'template/bookshelf/index'],
    function (Backbone, ShelfBookView, bookshelfTemplate) {
        "use strict";

        var IndexView = Backbone.View.extend({

            tagName: "div",
            className: "shelf",

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.close.bind(this));

                this.shelves = [];

                var i = 0;
                for (i; i < 5; i += 1) {
                    this.generateNewShelf(3);
                }

                this.collection.on("reset", this.render, this);
                this.collection.fetch();
            },

            render: function () {
                this.$el.html(bookshelfTemplate({
                    shelves: this.shelves
                }));
                this.collection.each(this.renderEbook, this);
                return this;
            },

            renderEbook: function (model) {
                var shelfBook = new ShelfBookView({
                    "model": model
                }), shelf = this.findFreeShelfTab();

                if (shelf) {
                    this.$el.find("div#shelf-" + shelf.id).append(shelfBook.el);
                    shelf.books.push(model);
                }
            },

            generateNewShelf: function (size) {
                this.shelves.push({
                    id: this.shelves.length,
                    size: size,
                    books: []
                });
            },

            findFreeShelfTab: function () {
                var freeShelves = this.shelves.filter(function (shelf) {
                    return (shelf.size - shelf.books.length) > 0;
                });
                if (freeShelves.length > 0) {
                    return freeShelves[0];
                }
                return false;
            },

            close: function () {
                this.stopListening(this.collection);
                this.remove();
            }
        });
        return IndexView;
    });