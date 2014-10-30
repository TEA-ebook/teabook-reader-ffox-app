/*global describe: true, should: true, it: true, curl: true, sinon: true, console: true */
(function() {
    "use strict";

    describe('Ebook:Chapter route', function () {
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
        });

        describe('is', function () {
            it('a Function', function (done) {
                curl(['route/ebook-chapter'], function (ebookChapterRouteHandler) {
                    ebookChapterRouteHandler.should.be.an.instanceof(Function);

                    ebookChapterRouteHandler();
                    console.info.should.have.been.calledOnce;

                    done();
                });
            });
        });
    });
}());