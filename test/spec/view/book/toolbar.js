/*global describe, should, it, curl, Backbone*/
(function() {
    "use strict";
    describe('Book.Toolbar view', function () {

        describe('instance', function () {
            it('is a Backbone.View', function (done) {
                curl(['view/book/toolbar'], function (BookToolbarView) {
                    var bookToolbarView = new BookToolbarView({});

                    bookToolbarView.should.be.an.instanceof(Backbone.View);

                    done();
                });
            });
        });
    });
}());