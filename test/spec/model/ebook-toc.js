/*global describe: true, should: true, it: true, curl: true, Backbone: true */
(function() {
    "use strict";
    describe('Ebook.Toc model', function () {
        describe('instance', function () {
            it('should be an instance of Backbone.Model', function (done) {
                curl(['model/ebook-toc'], function (EbookTocModel) {
                    var ebookToc = new EbookTocModel();
                    ebookToc.should.be.an.instanceof(Backbone.Model);
                    done();
                });
            });

            it('should parse the ncx toc', function (done) {
                curl(['model/ebook-toc', 'text!../../test/samples/epub-toc.ncx'], function (EbookTocModel, xmlToc) {
                    // Given an ebook-toc model
                    var ebookToc = new EbookTocModel();

                    // When we load ncx data
                    ebookToc.load(xmlToc);

                    // It should parse it and populate the model
                    ebookToc.get('items').should.have.length(20);

                    done();
                });
            });
        });
    });
}());