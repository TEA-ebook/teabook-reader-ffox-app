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
                    ebookToc.get('items').should.have.length(12);

                    done();
                });
            });

            it('should get the total end points of the toc', function (done) {
                curl(['model/ebook-toc', 'text!../../test/samples/epub-toc.ncx'], function (EbookTocModel, xmlToc) {
                    // Given an ebook-toc model
                    var ebookToc = new EbookTocModel();

                    // When we load ncx data
                    ebookToc.load(xmlToc);

                    // We should get 38 end points
                    ebookToc.getTotalEndPoints().should.be.equal(38);

                    done();
                });
            });

            it('should find a toc item position from a href', function (done) {
                curl(['model/ebook-toc', 'text!../../test/samples/epub-toc.ncx'], function (EbookTocModel, xmlToc) {
                    // Given an ebook-toc model loaded
                    var ebookToc = new EbookTocModel();
                    ebookToc.load(xmlToc);

                    // When we search for the book_0014.xhtml href
                    var itemPosition = ebookToc.getItemPosition("book_0014.xhtml");

                    // It should tell us it's the 11th item in the toc
                    itemPosition.should.be.equal(11);

                    done();
                });
            });

            it('should not find an unknown toc item', function (done) {
                curl(['model/ebook-toc', 'text!../../test/samples/epub-toc.ncx'], function (EbookTocModel, xmlToc) {
                    // Given an ebook-toc model loaded
                    var ebookToc = new EbookTocModel();
                    ebookToc.load(xmlToc);

                    // When we search for the book_i_dont_exist.xhtml href
                    var itemPosition = ebookToc.getItemPosition("book_i_dont_exist.xhtml");

                    // It should tell us that it doesn't exists
                    itemPosition.should.be.false;

                    done();
                });
            });
        });
    });
}());