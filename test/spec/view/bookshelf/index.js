/*global describe, beforeEach, afterEach, should, it, curl, sinon, $, Backbone*/
(function() {
    "use strict";
    describe('Bookshelf view', function () {
        var sandbox;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // fake db
            sandbox.stub(Backbone.Collection.prototype, "fetch");
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('should render itself', function (done) {
                curl(['collection/ebooks', 'model/ebook', 'view/bookshelf/index'], function (EbookCollection, EbookModel, BookshelfView) {
                    sandbox.spy(BookshelfView.prototype, "render");

                    // Given a bookshelf view with an empty ebook collection
                    var ebooks = new EbookCollection();
                    var bookshelfView = new BookshelfView({ collection: ebooks });

                    // When the ebook collection is loaded
                    ebooks.trigger('reset');
                    bookshelfView.close();

                    // The view should be rendered
                    BookshelfView.prototype.render.should.have.been.calledTwice;
                    bookshelfView.$el.find(".shelf-tab").should.have.length.above(1);

                    done();
                });
            });

            it('should render books if collection is populated', function (done) {
                curl(['collection/ebooks', 'model/ebook', 'view/bookshelf/index'], function (EbookCollection, EbookModel, BookshelfView) {
                    sandbox.spy(BookshelfView.prototype, "renderEbook");

                    // Given a bookshelf view with an ebook collection
                    var ebooks = new EbookCollection();
                    var bookshelfView = new BookshelfView({ collection: ebooks });

                    // When we add 2 books to the collection
                    ebooks.add(new EbookModel());
                    ebooks.add(new EbookModel());
                    bookshelfView.close();

                    // 2 books should be visible
                    bookshelfView.$el.find(".ebook").should.have.length(2);

                    done();
                });
            });
        });
    });
}());