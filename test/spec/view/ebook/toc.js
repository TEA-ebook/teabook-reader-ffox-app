/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, Backbone: true, EbookView: true*/
(function() {
    "use strict";
    describe('Ebook.Toc view', function () {
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
            it('is a Backbone.View', function (done) {
                curl(['view/ebook/toc'], function (EbookTocView) {
                    var ebookTocView = new EbookTocView({});

                    ebookTocView.should.be.an.instanceof(Backbone.View);

                    done();
                });
            });
        });
    });
}());