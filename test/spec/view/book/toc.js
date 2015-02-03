/*global describe, should, it, beforeEach, afterEach, curl, sinon, $, Backbone, EbookView*/
(function() {
    "use strict";
    describe('Book.Toc view', function () {
        var sandbox;

        beforeEach(function() {
            // create a sandbox
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('should render 12 items', function (done) {
                curl(['model/book-toc', 'view/book/toc', 'text!../../test/samples/epub-toc.ncx'], function (BookTocModel, BookTocView, tocXml) {
                    // Given a toc and a bookToc view
                    var toc = new BookTocModel();
                    toc.load(tocXml);
                    var bookTocView = new BookTocView({ model: toc, uri: 'books/mybook.epub' });

                    // When it renders
                    bookTocView.render();

                    // It should render 42 items in the toc
                    bookTocView.$el.find("li").should.have.length(42);

                    done();
                });
            });
        });
    });
}());