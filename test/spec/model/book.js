/*global describe: true, should: true, it: true, curl: true, Backbone: true */
(function() {
    "use strict";
    describe('Ebook model', function () {
        describe('instance', function () {
            it('should be an instance of Backbone.Model', function (done) {
                curl(['model/book'], function (BookModel) {
                    var ebook = new BookModel();
                    ebook.should.be.an.instanceof(Backbone.Model);
                    done();
                });
            });
        });
    });
}());