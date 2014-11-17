/*global describe: true, should: true, it: true, curl: true, Backbone: true */
(function() {
    "use strict";
    describe('Ebook.Pagination model', function () {
        describe('instance', function () {
            it('should be an instance of Backbone.Model', function (done) {
                curl(['model/ebook-pagination'], function (EbookPaginationModel) {
                    var ebookPagination = new EbookPaginationModel();
                    ebookPagination.should.be.an.instanceof(Backbone.Model);
                    done();
                });
            });

            it('should compute the pageLeft property', function (done) {
                curl(['model/ebook-pagination'], function (EbookPaginationModel) {
                    // Given a pagination model with page 5/23
                    var ebookPagination, paginationInfo;
                    paginationInfo = {
                        pageCurrent: 5,
                        pageTotal: 23
                    };

                    // When we initialize a pagination model with the infos
                    ebookPagination = new EbookPaginationModel(paginationInfo);

                    // It should have 18 pages left and not be the last page
                    ebookPagination.get('pageLeft').should.be.equal(18);
                    ebookPagination.get('lastPage').should.be.false;
                    ebookPagination.get('onePageLeft').should.be.false;

                    done();
                });
            });

            it('should compute the lastPage property', function (done) {
                curl(['model/ebook-pagination'], function (EbookPaginationModel) {
                    // Given a pagination model with page 12/12
                    var ebookPagination, paginationInfo;
                    paginationInfo = {
                        pageCurrent: 23,
                        pageTotal: 23
                    };

                    // When we initialize a pagination model with the infos
                    ebookPagination = new EbookPaginationModel(paginationInfo);

                    // It should have 0 page left and be the last page
                    ebookPagination.get('pageLeft').should.be.equal(0);
                    ebookPagination.get('lastPage').should.be.true;
                    ebookPagination.get('onePageLeft').should.be.false;

                    done();
                });
            });

            it('should compute the onePageLeft property', function (done) {
                curl(['model/ebook-pagination'], function (EbookPaginationModel) {
                    // Given a pagination instance with page 45/46
                    var ebookPagination = new EbookPaginationModel({
                        pageCurrent: 17,
                        pageTotal: 46
                    });

                    // When we update the pageCurrent to 45
                    ebookPagination.set('pageCurrent', 45);

                    // It should have 1 page left, not be the last page and it should have 1 page left
                    ebookPagination.get('pageLeft').should.be.equal(1);
                    ebookPagination.get('lastPage').should.be.false;
                    ebookPagination.get('onePageLeft').should.be.true;

                    done();
                });
            });
        });
    });
}());