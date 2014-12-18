/*global describe, should, it, beforeEach, afterEach, curl, sinon, $, Backbone, Teavents*/
(function () {
    "use strict";
    describe('Book.Pagination view', function () {
        var sandbox, paginationInfo;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // pagination info
            paginationInfo = {
                chapterTotal: 20,
                chapterCurrent: 5,
                pageTotal: 36,
                pageCurrent: 12
            };
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('should render the number of chapters', function (done) {
                curl(['model/book-pagination', 'view/book/pagination'], function (BookPaginationModel, BookPaginationView) {
                    // Given a book with 20 chapters and a chapter with 36 pages
                    var pagination = new BookPaginationModel(paginationInfo);
                    var bookPaginationView = new BookPaginationView({ model: pagination });

                    // When the pagination renders
                    bookPaginationView.render();

                    // It should render the current chapter number vs the total
                    bookPaginationView.$el.find(".book-pagination-chapters").text().trim().should.have.a.string(paginationInfo.chapterCurrent + "/" + paginationInfo.chapterTotal);

                    bookPaginationView.close();
                    done();
                });
            });

            it('should render the page position in the chapter', function (done) {
                curl(['model/book-pagination', 'view/book/pagination'], function (BookPaginationModel, BookPaginationView) {
                    // Given a book with 20 chapters and a chapter with 36 pages
                    var pagination = new BookPaginationModel(paginationInfo);
                    var bookPaginationView = new BookPaginationView({ model: pagination });

                    // When the pagination renders
                    bookPaginationView.render();

                    // It should render the progress bar with correct values
                    bookPaginationView.$el.find(".book-pagination-pages progress").attr("value").should.be.a.string(paginationInfo.pageCurrent);
                    bookPaginationView.$el.find(".book-pagination-pages progress").attr("max").should.be.a.string(paginationInfo.pageTotal);

                    bookPaginationView.close();
                    done();
                });
            });

            it('should react to readium PaginationChanged event -> re-render', function (done) {
                curl(['model/book-pagination', 'view/book/pagination'], function (BookPaginationModel, BookPaginationView) {
                    sandbox.spy(BookPaginationView.prototype, "render");

                    // Given a book with 20 chapters and a chapter with 36 pages
                    var pagination = new BookPaginationModel(paginationInfo);
                    var bookPaginationView = new BookPaginationView({ model: pagination });

                    // When readium has changed its pagination
                    Backbone.trigger(Teavents.Readium.PAGINATION_CHANGED,
                        {
                            pageInfo: {
                                spineItemIndex: 1,
                                spineItemPageIndex: 15,
                                spineItemPageCount: paginationInfo.pageTotal
                            },
                            spineHref: ''
                        });

                    // It should render itself
                    BookPaginationView.prototype.render.should.have.been.calledOnce;

                    bookPaginationView.close();
                    done();
                });
            });
        });
    });
}());