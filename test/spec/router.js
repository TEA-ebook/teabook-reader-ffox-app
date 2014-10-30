/*global describe: true, should: true, it: true, curl: true, sinon: true */
(function() {
    "use strict";
    describe('Router', function () {

        var sandbox, server;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.respondWith("GET", "books/list", [200, { "Content-Type": "text/plain" }, 'myepub1.epub\nmyepub2.epub']);

            // mute console
            sandbox.stub(console, "info");
        });

        afterEach(function () {
            // restore the environment as it was before
            server.restore();
            sandbox.restore();
        });

        describe('instance', function () {
            it('should have 3 routes', function (done) {
                curl(['router'], function (appRouter) {
                    appRouter.routes.should.have.keys(['', 'ebook/:uri', 'ebook/:uri/:chapter']);
                    done();
                });
            });
        });
    });
}());