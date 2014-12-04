/*global describe, beforeEach, afterEach, should, it, curl, sinon, $, Backbone*/
(function() {
    "use strict";
    describe('Bookcase view', function () {
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
                curl(['collection/books', 'model/book', 'view/bookcase/index'], function (BookCollection, BookModel, BookcaseView) {
                    sandbox.spy(BookcaseView.prototype, "render");

                    // Given a bookcase view with an empty book collection
                    var books = new BookCollection();
                    var bookcaseView = new BookcaseView({ collection: books });

                    // When the ebook collection is loaded
                    books.trigger('reset');
                    bookcaseView.close();

                    // The view should be rendered
                    BookcaseView.prototype.render.should.have.been.calledTwice;
                    bookcaseView.$el.find(".books").should.have.length(1);

                    done();
                });
            });

            it('should render books if collection is populated', function (done) {
                curl(['collection/books', 'model/book', 'view/bookcase/index'], function (BookCollection, BookModel, BookcaseView) {
                    // Given a bookshelf view with an book collection
                    var books = new BookCollection();
                    var bookcaseView = new BookcaseView({ collection: books });

                    // When we add 2 books to the collection
                    books.add(new BookModel());
                    books.add(new BookModel());
                    bookcaseView.close();

                    // 2 books should be visible
                    bookcaseView.$el.find(".book").should.have.length(2);

                    done();
                });
            });
        });
    });
}());