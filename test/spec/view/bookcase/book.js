/*global describe, should, it, beforeEach, afterEach, curl, sinon, $, Backbone*/
(function() {
    "use strict";
    describe('Bookcase.Book view', function () {
        var sandbox;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('should render the cover of the book', function (done) {
                curl(['model/book', 'view/bookcase/book'], function (BookModel, BookView) {
                    // Given a book view and a book model with a cover
                    var bookView;
                    var bookModel = new BookModel({
                        title: "mybook",
                        path: "/books/mybook.epub",
                        coverUrl: "samples/cover.jpeg"
                    });

                    // When the view is created and rendered
                    bookView = new BookView({ model: bookModel });

                    // The cover of the book should be visible
                    bookView.$el.find("img").attr("src").should.match(/cover\.jpeg$/);

                    done();
                });
            });

            it('should render a book icon if no cover', function (done) {
                curl(['model/book', 'view/bookcase/book'], function (BookModel, BookView) {
                    // Given a book view and a book model with no cover
                    var bookView;
                    var bookModel = new BookModel({
                        title: "mybook",
                        path: "/books/mybook.epub"
                    });

                    // When the view is created and rendered
                    bookView = new BookView({ model: bookModel });

                    // A book icon should be visible
                    bookView.$el.find("i").attr("class").should.match(/icon\-bookcase/);

                    done();
                });
            });
        });
    });
}());