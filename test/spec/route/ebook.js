/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, console: true, Backbone: true */
(function() {
    "use strict";
    describe('Ebook', function () {
        var sandbox;

        beforeEach(function() {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // spy console
            sandbox.stub(console, 'info');
        });

        afterEach(function() {
            // restore the environment as it was before
            sandbox.restore();

            Backbone.trigger('destroy');
        });

        describe('route', function () {
            it('is called with a URI', function (done) {
                curl(['route/ebook', 'view/ebook/index'], function (ebookRouteHandler, EbookView) {
                    sandbox.stub(EbookView.prototype);

                    ebookRouteHandler.should.be.an.instanceof(Function);

                    ebookRouteHandler("/books/myfile.epub");
                    console.info.should.have.been.calledOnce;

                    done();
                });
            });

            it('should open a chapter in the book', function (done) {
                curl(['route/ebook', 'view/ebook/index'], function (ebookRouteHandler, EbookView) {
                    sandbox.stub(EbookView.prototype);

                    ebookRouteHandler("/books/myfile.epub", "this-is-a-chapter.html");
                    console.info.should.have.been.calledTwice;

                    done();
                });
            });
        });
    });
}());