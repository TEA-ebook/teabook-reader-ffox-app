/*global describe: true, should: true, it: true, curl: true, sinon: true*/
(function() {
    "use strict";
    describe('Ebook.Options view', function () {
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
            it('should render 2 buttons', function (done) {
                curl(['view/ebook/options'], function (EbookOptionsView) {
                    // Given an ebookOptions view
                    var ebookOptionsView = new EbookOptionsView();

                    // When it renders
                    ebookOptionsView.render();

                    // It should render 1 range input
                    ebookOptionsView.$el.find("input[type=range]").should.have.length(1);

                    done();
                });
            });
        });
    });
}());