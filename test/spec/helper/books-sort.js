/*global describe, beforeEach, afterEach, should, it, curl, sinon, window, Teavents*/
(function() {
    "use strict";
    describe('Books sorting functions', function () {
        var sandbox, bookInfoA, bookInfoB, bookInfoC;

        bookInfoA = {
            title: "Neuromancer",
            authors: [ "William Gibson" ],
            added: 100,
            read: Date.now() + (5 * 60 * 1000)
        };

        bookInfoB = {
            title: "I, Robot",
            authors: [ "Isaac Asimov" ],
            added: 200,
            read: Date.now() + (125 * 60 * 1000)
        };

        bookInfoC = {
            title: "Green mars",
            authors: [ "Kim Stanley Robinson" ],
            added: 300,
            read: 0
        };

        beforeEach(function() {
            // create a sandbox
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('author', function () {
            it('should sort by author a->z', function (done) {
                curl(['helper/books-sort', 'model/book', 'collection/books'], function (BooksSort, BookModel, BookCollection) {
                    // Given 3 books and a book collection
                    var bookA = new BookModel(bookInfoA), bookB = new BookModel(bookInfoB), bookC = new BookModel(bookInfoC);
                    var books = new BookCollection([ bookA, bookB, bookC ]);

                    // When we sort it author a->z
                    books.comparator = BooksSort.authorAsc;
                    books.sort();

                    // Then bookB should be first and bookA last
                    books.models[0].get("title").should.be.equal(bookInfoB.title);
                    books.models[2].get("title").should.be.equal(bookInfoA.title);

                    done();
                });
            });

            it('should sort by author z->a', function (done) {
                curl(['helper/books-sort', 'model/book', 'collection/books'], function (BooksSort, BookModel, BookCollection) {
                    // Given 3 books and a book collection
                    var bookA = new BookModel(bookInfoA), bookB = new BookModel(bookInfoB), bookC = new BookModel(bookInfoC);
                    var books = new BookCollection([ bookA, bookB, bookC ]);

                    // When we sort it author z->a
                    books.comparator = BooksSort.authorDesc;
                    books.sort();

                    // Then bookA should be first and bookB last
                    books.models[0].get("title").should.be.equal(bookInfoA.title);
                    books.models[2].get("title").should.be.equal(bookInfoB.title);

                    done();
                });
            });
        });

        describe('title', function () {
            it('should sort by title a->z', function (done) {
                curl(['helper/books-sort', 'model/book', 'collection/books'], function (BooksSort, BookModel, BookCollection) {
                    // Given 3 books and a book collection
                    var bookA = new BookModel(bookInfoA), bookB = new BookModel(bookInfoB), bookC = new BookModel(bookInfoC);
                    var books = new BookCollection([ bookA, bookB, bookC ]);

                    // When we sort it title a->z
                    books.comparator = BooksSort.titleAsc;
                    books.sort();

                    // Then bookC should be first and bookA last
                    books.models[0].get("title").should.be.equal(bookInfoC.title);
                    books.models[2].get("title").should.be.equal(bookInfoA.title);

                    done();
                });
            });

            it('should sort by title z->a', function (done) {
                curl(['helper/books-sort', 'model/book', 'collection/books'], function (BooksSort, BookModel, BookCollection) {
                    // Given 3 books and a book collection
                    var bookA = new BookModel(bookInfoA), bookB = new BookModel(bookInfoB), bookC = new BookModel(bookInfoC);
                    var books = new BookCollection([ bookA, bookB, bookC ]);

                    // When we sort it title z->a
                    books.comparator = BooksSort.titleDesc;
                    books.sort();

                    // Then bookA should be first and bookC last
                    books.models[0].get("title").should.be.equal(bookInfoA.title);
                    books.models[2].get("title").should.be.equal(bookInfoC.title);

                    done();
                });
            });
        });

        describe('lastRead', function () {
            it('should sort last reading time', function (done) {
                curl(['helper/books-sort', 'model/book', 'collection/books'], function (BooksSort, BookModel, BookCollection) {
                    // Given 3 books and a book collection
                    var bookA = new BookModel(bookInfoA), bookB = new BookModel(bookInfoB), bookC = new BookModel(bookInfoC);
                    var books = new BookCollection([ bookA, bookB, bookC ]);

                    // When we sort by last read
                    books.comparator = BooksSort.lastRead;
                    books.sort();

                    // Then bookB should be first and bookC last
                    books.models[0].get("title").should.be.equal(bookInfoB.title);
                    books.models[2].get("title").should.be.equal(bookInfoC.title);

                    done();
                });
            });
        });

        describe('lastAdded', function () {
            it('should sort last added time', function (done) {
                curl(['helper/books-sort', 'model/book', 'collection/books'], function (BooksSort, BookModel, BookCollection) {
                    // Given 3 books and a book collection
                    var bookA = new BookModel(bookInfoA), bookB = new BookModel(bookInfoB), bookC = new BookModel(bookInfoC);
                    var books = new BookCollection([ bookA, bookB, bookC ]);

                    // When we sort by last read
                    books.comparator = BooksSort.lastAdded;
                    books.sort();

                    // Then bookC should be first and bookA last
                    books.models[0].get("title").should.be.equal(bookInfoC.title);
                    books.models[2].get("title").should.be.equal(bookInfoA.title);

                    done();
                });
            });
        });
    });
}());