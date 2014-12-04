/*global describe, should, it, beforeEach, afterEach, curl, sinon, $, console, Backbone */
(function() {
    "use strict";
    describe('Book', function () {
        var sandbox;

        beforeEach(function() {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // spy console
            sandbox.stub(console, 'info');
        });

        afterEach(function() {
            // restore the environment as it was before
            sandbox.restore();

            Backbone.trigger('destroy');
        });

        describe('route', function () {
            it('is called with a hash', function (done) {
                curl(['route/book', 'view/book/index'], function (bookRouteHandler, BookView) {
                    sandbox.stub(BookView.prototype);

                    bookRouteHandler.should.be.an.instanceof(Function);

                    bookRouteHandler("jf8kfl34ys");
                    console.info.should.have.been.calledOnce;

                    done();
                });
            });

            it('should open a chapter in the book', function (done) {
                curl(['route/book', 'view/book/index'], function (bookRouteHandler, BookView) {
                    sandbox.stub(BookView.prototype);

                    bookRouteHandler("jf8kfl34ys", "this-is-a-chapter.html");
                    console.info.should.have.been.calledTwice;

                    done();
                });
            });
        });
    });
}());