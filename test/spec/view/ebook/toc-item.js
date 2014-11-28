/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, Backbone: true, EbookView: true*/
(function() {
    "use strict";
    describe('Ebook.Toc.Item view', function () {
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
                curl(['model/ebook-toc-item', 'view/ebook/toc-item'], function (EbookTocItemModel, EbookTocItemView) {
                    // Given a toc item and an ebookTocItem view
                    var tocItem = new EbookTocItemModel({ label: "test" });
                    var ebookTocItemView = new EbookTocItemView({ model: tocItem });

                    // When it renders
                    ebookTocItemView.render();

                    // It should render the label of the toc item
                    ebookTocItemView.$el.text().trim().should.be.equal("test");

                    done();
                });
            });

            it('should render 2 toc child items', function (done) {
                curl(['model/ebook-toc-item', 'view/ebook/toc-item'], function (EbookTocItemModel, EbookTocItemView) {
                    // Given a toc item with 2 child items and an ebookTocItem view
                    var childItems = [], tocItem = new EbookTocItemModel({ label: "test" });
                    var ebookTocItemView = new EbookTocItemView({ model: tocItem });
                    childItems.push(new EbookTocItemModel({ label: "child1" }));
                    childItems.push(new EbookTocItemModel({ label: "child2" }));
                    tocItem.set('items', childItems);

                    // When it renders
                    ebookTocItemView.render();

                    // It should render the label of the toc item
                    ebookTocItemView.$el.find("li").should.have.length(2);

                    done();
                });
            });
        });
    });
}());