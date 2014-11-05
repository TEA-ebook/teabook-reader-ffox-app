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
            it('should render 12 items', function (done) {
                curl(['model/ebook-toc', 'view/ebook/toc', 'text!../../test/samples/epub-toc.ncx'], function (EbookTocModel, EbookTocView, tocXml) {
                    // Given a toc and an ebookToc view
                    var toc = new EbookTocModel();
                    toc.load(tocXml);
                    var ebookTocView = new EbookTocView({ model: toc, uri: 'books/myebook.epub' });

                    // When it renders
                    ebookTocView.render();

                    // It should render 2 items in the toc
                    ebookTocView.$el.find("li").should.have.length(12);

                    done();
                });
            });
        });
    });
}());