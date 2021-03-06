/*global define, window*/
define('view/bookcase/added-books', ['backbone', 'template/bookcase/added-books'],
    function (Backbone, template) {
        "use strict";

        var AddedBooksView = Backbone.View.extend({

            className: "added-books",

            events: {
                "click": "hide"
            },

            render: function (books) {
                if (books && books.length > 0) {
                    this.$el.html(template({
                        total: books.length,
                        books: books.slice(0, 3).map(function (book) {
                            return book.attributes;
                        })
                    }));

                    window.document.l10n.updateData({ "total": books.length });
                    window.document.l10n.localizeNode(this.el);
                }
            },

            hide: function (event) {
                if (event.target.classList.contains("added-books")) {
                    this.remove();
                }
            }
        });

        return AddedBooksView;
    });