/*global describe: true, should: true, it: true, curl: true, Backbone: true */
(function() {
    "use strict";
    describe('Book.Pagination model', function () {
        describe('instance', function () {
            it('should be an instance of Backbone.Model', function (done) {
                curl(['model/book-pagination'], function (BookPaginationModel) {
                    var bookPagination = new BookPaginationModel();
                    bookPagination.should.be.an.instanceof(Backbone.Model);
                    done();
                });
            });

            it('should compute the pageLeft property', function (done) {
                curl(['model/book-pagination'], function (BookPaginationModel) {
                    // Given a pagination model with page 5/23
                    var bookPagination, paginationInfo;
                    paginationInfo = {
                        pageCurrent: 5,
                        pageTotal: 23
                    };

                    // When we initialize a pagination model with the infos
                    bookPagination = new BookPaginationModel(paginationInfo);

                    // It should have 18 pages left and not be the last page
                    bookPagination.get('pageLeft').should.be.equal(18);
                    bookPagination.get('lastPage').should.be.false;
                    bookPagination.get('onePageLeft').should.be.false;

                    done();
                });
            });

            it('should compute the lastPage property', function (done) {
                curl(['model/book-pagination'], function (BookPaginationModel) {
                    // Given a pagination model with page 12/12
                    var bookPagination, paginationInfo;
                    paginationInfo = {
                        pageCurrent: 23,
                        pageTotal: 23
                    };

                    // When we initialize a pagination model with the infos
                    bookPagination = new BookPaginationModel(paginationInfo);

                    // It should have 0 page left and be the last page
                    bookPagination.get('pageLeft').should.be.equal(0);
                    bookPagination.get('lastPage').should.be.true;
                    bookPagination.get('onePageLeft').should.be.false;

                    done();
                });
            });

            it('should compute the onePageLeft property', function (done) {
                curl(['model/book-pagination'], function (BookPaginationModel) {
                    // Given a pagination instance with page 45/46
                    var bookPagination = new BookPaginationModel({
                        pageCurrent: 17,
                        pageTotal: 46
                    });

                    // When we update the pageCurrent to 45
                    bookPagination.set('pageCurrent', 45);

                    // It should have 1 page left, not be the last page and it should have 1 page left
                    bookPagination.get('pageLeft').should.be.equal(1);
                    bookPagination.get('lastPage').should.be.false;
                    bookPagination.get('onePageLeft').should.be.true;

                    done();
                });
            });
        });
    });
}());