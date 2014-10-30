/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, Backbone: true*/
(function() {
    "use strict";
    describe('Bookshelf view', function () {
        var sandbox, server;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.respondWith("GET", "books/list", [200, { "Content-Type": "text/plain" }, 'myepub1.epub\nmyepub2.epub']);
        });

        afterEach(function () {
            // restore the environment as it was before
            server.restore();
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
                    BookshelfView.prototype.render.should.have.been.calledOnce;
                    bookshelfView.$el.find(".shelf-tab").should.have.length.above(1);

                    done();
                });
            });

            it('should render books if collection is populated', function (done) {
                curl(['collection/ebooks', 'model/ebook', 'view/bookshelf/index'], function (EbookCollection, EbookModel, BookshelfView) {
                    sandbox.spy(BookshelfView.prototype, "renderEbook");

                    // Given a bookshelf view with 2 ebooks in the collection
                    var ebooks = new EbookCollection();
                    ebooks.add(new EbookModel());
                    ebooks.add(new EbookModel());
                    var bookshelfView = new BookshelfView({ collection: ebooks });

                    // When the ebook collection is loaded
                    ebooks.trigger('reset');
                    bookshelfView.close();

                    // 2 books should be visible
                    bookshelfView.$el.find(".ebook").should.have.length(2);

                    done();
                });
            });
        });
    });
}());