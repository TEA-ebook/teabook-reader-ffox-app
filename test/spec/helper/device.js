/*global describe, beforeEach, afterEach, should, it, curl, sinon, Backbone, DeviceStorage, ArrayBuffer*/
(function() {
    "use strict";
    describe('Device helper', function () {
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

        describe('should', function () {
            it('scan SD card and find 2 ebooks', function (done) {
                curl(['helper/device', 'model/ebook', 'collection/ebooks'], function (DeviceHelper, EbookModel, EbookCollection) {
                    var counter = 0;

                    // skip indexedDB
                    sandbox.stub(EbookModel.prototype, "save", function (attr, options) {
                        options.success();
                    });

                    // fake device storage get request
                    sandbox.stub(DeviceStorage.prototype, "get", function () {
                        var request = {
                            onsuccess: false,
                            onerror: function (err) {
                                console.error(err);
                            }
                        };
                        request.result = {
                            name: "/sdcard/mybook.epub",
                            content: new ArrayBuffer(1024)
                        };
                        setTimeout(function () {
                            if (request.onsuccess) {
                                request.onsuccess();
                            }
                        }, 5);
                        return request;
                    });

                    // fake call to web worker
                    sandbox.stub(DeviceHelper, "scanFile", function (file, ebook, callback) {
                        callback();
                    });

                    // Given 2 fake books on the sd card and an ebook collection
                    var ebooks = new EbookCollection();

                    // When we scan the card
                    DeviceHelper.scanSdCard(ebooks);

                    // Then the collection should have 2 ebooks
                    ebooks.on("add", function () {
                        counter += 1;
                        if (counter === 2) {
                            ebooks.models.should.have.length(2);
                            done();
                        }
                    });
                });
            });
        });
    });
}());