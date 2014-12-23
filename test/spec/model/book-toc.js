/*global describe: true, should: true, it: true, curl: true, Backbone: true */
(function() {
    "use strict";
    describe('Book.Toc model', function () {
        describe('instance', function () {
            it('should be an instance of Backbone.Model', function (done) {
                curl(['model/book-toc'], function (BookTocModel) {
                    var bookToc = new BookTocModel();
                    bookToc.should.be.an.instanceof(Backbone.Model);
                    done();
                });
            });

            it('should parse the ncx toc', function (done) {
                curl(['model/book-toc', 'text!../../test/samples/epub-toc.ncx'], function (BookTocModel, xmlToc) {
                    // Given an book-toc model
                    var bookToc = new BookTocModel();

                    // When we load ncx data
                    bookToc.load(xmlToc);

                    // It should parse it and populate the model
                    bookToc.get('items').should.have.length(12);

                    done();
                });
            });

            it('should get the total end points of the toc', function (done) {
                curl(['model/book-toc', 'text!../../test/samples/epub-toc.ncx'], function (BookTocModel, xmlToc) {
                    // Given an book-toc model
                    var bookToc = new BookTocModel();

                    // When we load ncx data
                    bookToc.load(xmlToc);

                    // We should get 38 end points
                    bookToc.getTotalEndPoints().should.be.equal(38);

                    done();
                });
            });

            it('should find a toc item position from a href', function (done) {
                curl(['model/book-toc', 'text!../../test/samples/epub-toc.ncx'], function (BookTocModel, xmlToc) {
                    // Given an book-toc model loaded
                    var bookToc = new BookTocModel();
                    bookToc.load(xmlToc);

                    // When we search for the book_0014.xhtml href
                    var itemPosition = bookToc.getItemPosition("book_0014.xhtml#auto-toc12");

                    // It should tell us it's the 11th item in the toc
                    itemPosition.should.be.equal(11);

                    done();
                });
            });

            it('should not find an unknown toc item', function (done) {
                curl(['model/book-toc', 'text!../../test/samples/epub-toc.ncx'], function (BookTocModel, xmlToc) {
                    // Given an book-toc model loaded
                    var bookToc = new BookTocModel();
                    bookToc.load(xmlToc);

                    // When we search for the book_i_dont_exist.xhtml href
                    var itemPosition = bookToc.getItemPosition("book_i_dont_exist.xhtml");

                    // It should tell us that it doesn't exists
                    itemPosition.should.be.false;

                    done();
                });
            });
        });
    });
}());