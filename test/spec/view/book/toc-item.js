/*global describe, should, it, curl, sinon, $, Backbone, EbookView*/
(function() {
    "use strict";
    describe('Book.Toc.Item view', function () {
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
            it('should render the label of the toc item', function (done) {
                curl(['model/book-toc-item', 'view/book/toc-item'], function (BookTocItemModel, BookTocItemView) {
                    // Given a toc item and a bookTocItem view
                    var tocItem = new BookTocItemModel({ label: "test" });
                    var bookTocItemView = new BookTocItemView({ model: tocItem });

                    // When it renders
                    bookTocItemView.render();

                    // It should render the label of the toc item
                    bookTocItemView.$el.text().trim().should.be.equal("test");

                    done();
                });
            });

            it('should render 2 toc child items', function (done) {
                curl(['model/book-toc-item', 'view/book/toc-item'], function (BookTocItemModel, BookTocItemView) {
                    // Given a toc item with 2 child items and a bookTocItem view
                    var childItems = [], tocItem = new BookTocItemModel({ label: "test" });
                    var bookTocItemView = new BookTocItemView({ model: tocItem });
                    childItems.push(new BookTocItemModel({ label: "child1" }));
                    childItems.push(new BookTocItemModel({ label: "child2" }));
                    tocItem.set('items', childItems);

                    // When it renders
                    bookTocItemView.render();

                    // It should render the label of the toc item
                    bookTocItemView.$el.find("li").should.have.length(2);

                    done();
                });
            });
        });
    });
}());