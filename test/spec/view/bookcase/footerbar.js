/*global describe, beforeEach, afterEach, should, it, curl, sinon, Backbone*/
(function() {
    "use strict";
    describe('Bookcase.FooterBar view', function () {
        var sandbox;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('should render 3 buttons', function (done) {
                curl(['view/bookcase/footerbar'],
                    function (FooterBarView) {
                         // Given a footerBar view
                        var footerBarView = new FooterBarView();

                        // When it renders
                        footerBarView.render();

                        // It should have 3 icons
                        footerBarView.$el.find("button.add").should.have.length(1);
                        footerBarView.$el.find("button.remove").should.have.length(1);
                        footerBarView.$el.find("button.sort").should.have.length(1);

                        done();
                    }
                );
            });
            it('should render actionBar in delete mode', function (done) {
                curl(['view/bookcase/footerbar', 'view/bookcase/actionbar'],
                    function (FooterBarView, ActionBarView) {
                        // Spy actionBar view
                        sandbox.spy(ActionBarView.prototype, "render");

                        // Given a rendered footerBar view
                        var footerBarView = new FooterBarView();
                        footerBarView.render();

                        // When delete mode is activated
                        footerBarView.showDelete();

                        // Action bar should be rendered
                        ActionBarView.prototype.render.should.have.been.calledOnce;

                        // And remove button should be selected
                        footerBarView.$el.find("button.remove").hasClass("selected").should.be.true;

                        done();
                    }
                );
            });
            it('should highlight sort button in sort mode', function (done) {
                curl(['view/bookcase/footerbar'],
                    function (FooterBarView, ActionBarView) {
                        // Given a rendered footerBar view
                        var footerBarView = new FooterBarView();
                        footerBarView.render();

                        // When sort mode is activated
                        footerBarView.showSort();

                        // sort button should be selected
                        footerBarView.$el.find("button.sort").hasClass("selected").should.be.true;

                        done();
                    }
                );
            });
        });
    });
}());