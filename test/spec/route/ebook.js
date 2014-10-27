/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, console: true, Backbone: true */
(function() {
    "use strict";
    describe('Ebook route', function () {
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

        describe('is', function () {
            it('called with a URI', function (done) {
                curl(['route/ebook'], function (ebookRouteHandler) {
                    ebookRouteHandler.should.be.an.instanceof(Function);

                    ebookRouteHandler("/books/myfile.epub");
                    console.info.should.have.been.calledOnce;

                    done();
                });
            });
        });
    });
}());