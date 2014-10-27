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
            it('is a Backbone.View', function (done) {
                curl(['model/ebook', 'view/bookshelf/book'], function (EbookModel, BookView) {
                    var bookView = new BookView({ model: new EbookModel() });

                    bookView.should.be.an.instanceof(Backbone.View);

                    done();
                });
            });

            it('should render the name of the book', function (done) {
                curl(['model/ebook', 'view/bookshelf/book'], function (EbookModel, BookView) {
                    var bookView = new BookView({ model: new EbookModel({ name: "myebook" }) });

                    bookView.$el.text().should.match(/^myebook$/);

                    done();
                });
            });
        });
    });
}());