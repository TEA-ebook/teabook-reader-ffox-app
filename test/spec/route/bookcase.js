/*global describe, should, it, curl, beforeEach, afterEach, sinon, console */
(function() {
    "use strict";

    describe('Bookcase route', function () {
        var sandbox, server;

        beforeEach(function() {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // spy console
            sandbox.stub(console, 'info');

            // fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.respondWith("GET", "books/list", [200, { "Content-Type": "text/plain" }, 'myepub1.epub\nmyepub2.epub']);
        });

        afterEach(function() {
            // restore the environment as it was before
            server.restore();
            sandbox.restore();
        });

        describe('is', function () {
            it('a Function', function (done) {
                curl(['route/bookcase', 'view/bookcase/index'], function (bookcaseRouteHandler, BookcaseView) {
                    sandbox.stub(BookcaseView.prototype);

                    bookcaseRouteHandler.should.be.an.instanceof(Function);

                    bookcaseRouteHandler();
                    console.info.should.have.been.calledOnce;

                    done();
                });
            });
        });
    });
}());