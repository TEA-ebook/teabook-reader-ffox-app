/*global describe, should, it, beforeEach, afterEach, curl, sinon, $, Backbone*/
(function() {
    "use strict";
    describe('Bookcase.AddedBooks view', function () {
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
            it('should render 1 book cover if 1 book added', function (done) {
                curl(['model/book', 'view/bookcase/added-books'], function (BookModel, AddedBooksView) {
                    // Given a addedBooks view and 1 book
                    var addedBooksView = new AddedBooksView();
                    var books = [ new BookModel({
                        title: "mybook",
                        path: "/books/mybook.epub",
                        coverUrl: "samples/cover.jpeg"
                    }) ];

                    // When the view is rendered
                    addedBooksView.render(books);

                    // The book cover should be visible
                    addedBooksView.$el.find("img").attr("src").should.equals("samples/cover.jpeg");

                    done();
                });
            });

            it('should render only 3 books if 5 added', function (done) {
                curl(['model/book', 'view/bookcase/added-books'], function (BookModel, AddedBooksView) {
                    // Given a addedBooks view and 5 books
                    var addedBooksView = new AddedBooksView();
                    var books = [];
                    books.push(new BookModel({
                        title: "mybook1",
                        path: "/books/mybook1.epub",
                        coverUrl: "samples/cover.jpeg"
                    }));
                    books.push(new BookModel({
                        title: "mybook2",
                        path: "/books/mybook2.epub",
                        coverUrl: "samples/cover.jpeg"
                    }));
                    books.push(new BookModel({
                        title: "mybook3",
                        path: "/books/mybook3.epub",
                        coverUrl: "samples/cover.jpeg"
                    }));
                    books.push(new BookModel({
                        title: "mybook4",
                        path: "/books/mybook4.epub",
                        coverUrl: "samples/cover.jpeg"
                    }));
                    books.push(new BookModel({
                        title: "mybook5",
                        path: "/books/mybook5.epub",
                        coverUrl: "samples/cover.jpeg"
                    }));

                    // When the view is rendered
                    addedBooksView.render(books);

                    // Only 3 covers should be visible
                    addedBooksView.$el.find("img").should.have.length(3);

                    done();
                });
            });

            it('should not render if no book added', function (done) {
                curl(['view/bookcase/added-books'], function (AddedBooksView) {
                    // Given a addedBooks view
                    var addedBooksView = new AddedBooksView();

                    // When the view is rendered
                    addedBooksView.render();

                    // The book cover should be visible
                    addedBooksView.$el.find("img").should.have.length(0);

                    done();
                });
            });
        });
    });
}());