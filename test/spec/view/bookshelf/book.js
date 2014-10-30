/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, Backbone: true*/
(function() {
    "use strict";
    describe('Bookshelf.Book view', function () {
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
            it('should render the name of the book', function (done) {
                curl(['model/ebook', 'view/bookshelf/book'], function (EbookModel, BookView) {
                    // Given a book view with an ebook model
                    var bookView;
                    var ebookModel = new EbookModel({ name: "myebook" });

                    // When the view is created and rendered
                    bookView = new BookView({ model: ebookModel });

                    // The name of the book should be visible
                    bookView.$el[0].textContent.should.match(/^myebook$/);

                    done();
                });
            });
        });
    });
}());