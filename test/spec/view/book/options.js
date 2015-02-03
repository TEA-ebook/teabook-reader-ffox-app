/*global describe, should, it, beforeEach, afterEach, curl, sinon*/
(function() {
    "use strict";
    describe('Book.Options view', function () {
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
                curl(['view/book/options'], function (BookOptionsView) {
                    // Given an bookOptions view
                    var bookOptionsView = new BookOptionsView();

                    // When it renders
                    bookOptionsView.render();

                    // It should render 1 range input
                    bookOptionsView.$el.find("input[type=range]").should.have.length(1);

                    done();
                });
            });
        });
    });
}());