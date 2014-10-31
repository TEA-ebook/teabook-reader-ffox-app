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

                    // It should render 2 buttons
                    ebookOptionsView.$el.find("button").should.have.length(2);

                    done();
                });
            });
        });


        describe('click', function () {
            it('on A+ -> ask for Readium to increase font size', function (done) {
                curl(['view/ebook/options'], function (EbookOptionsView) {
                    Backbone.on("font-size:increase", checkIncreaseEvent);

                    // Given an ebookOptions rendered view
                    var ebookOptionsView = new EbookOptionsView();
                    ebookOptionsView.render();

                    // When the user taps on A+
                    ebookOptionsView.$el.find("button.increase-font-size").click();

                    // It should receive the right event
                    function checkIncreaseEvent() {
                        Backbone.off("font-size:increase");
                        done();
                    }
                });
            });

            it('on A- -> ask for Readium to decrease font size', function (done) {
                curl(['view/ebook/options'], function (EbookOptionsView) {
                    Backbone.on("font-size:decrease", checkDecreaseEvent);

                    // Given an ebookOptions view
                    var ebookOptionsView = new EbookOptionsView();
                    ebookOptionsView.render();

                    // When it renders
                    ebookOptionsView.$el.find("button.decrease-font-size").click();

                    // It should receive the right event
                    function checkDecreaseEvent() {
                        Backbone.off("font-size:decrease");
                        done();
                    }
                });
            });
        });
    });
}());