/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, Backbone: true, Teavents: true*/
(function() {
    "use strict";
    describe('Ebook.Pagination view', function () {
        var sandbox, paginationInfo;

        beforeEach(function() {
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

        afterEach(function() {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('should render the number of chapters', function (done) {
                curl(['model/ebook-pagination', 'view/ebook/pagination'], function (EbookPaginationModel, EbookPaginationView) {
                    // Given an ebook with 20 chapters and a chapter with 36 pages
                    var pagination = new EbookPaginationModel(paginationInfo);
                    var ebookPaginationView = new EbookPaginationView({ model: pagination });

                    // When the pagination renders
                    ebookPaginationView.render();

                    // It should render the current chapter number vs the total
                    ebookPaginationView.$el.find(".ebook-pagination-chapters").text().trim().should.be.a.string(paginationInfo.chapterCurrent + "/" + paginationInfo.chapterTotal);

                    ebookPaginationView.close();
                    done();
                });
            });

            it('should render the page position in the chapter', function (done) {
                curl(['model/ebook-pagination', 'view/ebook/pagination'], function (EbookPaginationModel, EbookPaginationView) {
                    // Given an ebook with 20 chapters and a chapter with 36 pages
                    var pagination = new EbookPaginationModel(paginationInfo);
                    var ebookPaginationView = new EbookPaginationView({ model: pagination });

                    // When the pagination renders
                    ebookPaginationView.render();

                    // It should render the current chapter number vs the total
                    ebookPaginationView.$el.find(".ebook-pagination-pages progress").attr("value").should.be.a.string(paginationInfo.pageCurrent);
                    ebookPaginationView.$el.find(".ebook-pagination-pages progress").attr("max").should.be.a.string(paginationInfo.pageTotal);

                    ebookPaginationView.close();
                    done();
                });
            });

            it('should react to readium PaginationChanged event -> re-render', function (done) {
                curl(['model/ebook-pagination', 'view/ebook/pagination'], function (EbookPaginationModel, EbookPaginationView) {
                    sandbox.spy(EbookPaginationView.prototype, "render");

                    // Given an ebook with 20 chapters and a chapter with 36 pages
                    var pagination = new EbookPaginationModel(paginationInfo);
                    var ebookPaginationView = new EbookPaginationView({ model: pagination });

                    // When readium has changed its pagination
                    Backbone.trigger(Teavents.MESSAGE, {
                        type: "Readium:" + Teavents.Readium.PAGINATION_CHANGED,
                        data: {
                            pageInfo: {
                                spineItemIndex: 1,
                                spineItemPageIndex: 15,
                                spineItemPageCount: paginationInfo.pageTotal
                            },
                            spineHref: ''
                        }
                    });

                    // It should render itself
                    EbookPaginationView.prototype.render.should.have.been.calledOnce;

                    ebookPaginationView.close();
                    done();
                });
            });
        });
    });
}());