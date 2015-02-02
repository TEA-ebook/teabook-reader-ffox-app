/*global describe, beforeEach, afterEach, should, it, curl, sinon, Backbone*/
(function() {
    "use strict";
    describe('Bookcase.HeaderBar view', function () {
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
            it('should render itself', function (done) {
                curl(['view/bookcase/headerbar'],
                    function (HeaderBarView) {
                         // Given a headerBar view
                        var headerBarView = new HeaderBarView();

                        // When it renders
                        headerBarView.render();

                        // A search input should be in the dom
                        headerBarView.$el.find("input[type='search']").should.have.length(1);

                        done();
                    }
                );
            });
            it('should switch to search mode', function (done) {
                curl(['view/bookcase/headerbar'],
                    function (HeaderBarView) {
                        // Given a rendered headerBar view
                        var headerBarView = new HeaderBarView();
                        headerBarView.render();

                        // When search mode is requested
                        headerBarView.searchMode();

                        // headerBar should be also a searchBar
                        headerBarView.el.classList.contains("searchbar").should.be.true;

                        done();
                    }
                );
            });
            it('should switch to selection mode', function (done) {
                curl(['view/bookcase/headerbar'],
                    function (HeaderBarView) {
                        // Given a rendered headerBar view
                        var headerBarView = new HeaderBarView();
                        headerBarView.render();

                        // When selection mode is requested
                        headerBarView.selectionMode();

                        // headerBar should turn into selection mode
                        headerBarView.el.classList.contains("selection").should.be.true;

                        done();
                    }
                );
            });
        });
    });
}());