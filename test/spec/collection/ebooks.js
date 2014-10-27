/*global describe: true, should: true, it: true, curl: true, sinon: true, DeviceStorage: true */
(function() {
    "use strict";
    describe('Ebook collection', function () {
        var server;

        beforeEach(function() {
            // create a server
            server = sinon.fakeServer.create();

            // fake response
            server.autoRespond = true;
            server.respondWith("GET", "books/list", [200, { "Content-Type": "text/plain" }, 'myepub1.epub\nmyepub2.epub']);
        });

        afterEach(function() {
            // restore the environment as it was before
            server.restore();
        });

        describe('fetch()', function () {
            it('should get 2 epub files', function (done) {
                curl(['collection/ebooks'], function (EbookCollection) {
                    var ebooks = new EbookCollection();

                    ebooks.fetch.should.be.an.instanceof(Function);

                    ebooks.on('reset', function() {
                        ebooks.length.should.be.at.least(2);
                        done();
                    });
                    ebooks.fetch();
                });
            });
        });
    });
}());