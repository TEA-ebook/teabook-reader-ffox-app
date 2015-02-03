/*global describe, should, it, beforeEach, afterEach, curl, sinon, Backbone, Teavents*/
(function() {
    "use strict";
    describe('Book.Bookmarks view', function () {
        var sandbox;

        beforeEach(function() {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // stub model save
            sandbox.stub(Backbone.Model.prototype, "save", function (options) {
                if (options && options.success) {
                    options.success();
                }
            });

            // stub collection fetch
            sandbox.stub(Backbone.Collection.prototype, "fetch", function (options) {
                if (options && options.success) {
                    options.success();
                }
            });
        });

        afterEach(function() {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('empty instance', function () {
            it('should render 2 buttons', function (done) {
                curl(['view/book/bookmarks'], function (BookmarksView) {
                    // Given an empty bookmarks view
                    var bookmarksView;

                    // When it renders
                    bookmarksView = new BookmarksView({ hash: 'ad45zad8d' });

                    // It should render 1 add button and an empty list
                    bookmarksView.$el.find("button").should.have.length(1);
                    bookmarksView.$el.find("ul").should.have.length(1);

                    done();
                });
            });

            it('should request to bookmark current page', function (done) {
                curl(['view/book/bookmarks'], function (BookmarksView) {
                    // Given an empty bookmarks view
                    var bookmarksView = new BookmarksView({ hash: 'ad45zad8d' });

                    // When we press the add button
                    setTimeout(function () {
                        bookmarksView.$el.find("button").click();
                    }, 10);

                    // It should request to bookmark the page
                    Backbone.on(Teavents.Actions.BOOKMARK_PAGE, done);
                });
            });

            it('should save the new bookmark and render it', function (done) {
                curl(['view/book/bookmarks'], function (BookmarksView) {
                    // Given an empty bookmarks view
                    var bookmarksView = new BookmarksView({ hash: 'ad45zad8d' });

                    // When we save a new bookmark
                    bookmarksView.saveBookmark({ some: 'data' });

                    // It should render the new bookmark
                    bookmarksView.collection.size().should.equals(1);
                    bookmarksView.$el.find("li").should.have.length(1);

                    done();
                });
            });
        });

        describe('with 2 bookmarks', function () {
            it('should render 2 bookmarks', function (done) {
                curl(['model/bookmark', 'view/book/bookmarks'], function (Bookmark, BookmarksView) {
                    // Given an empty bookmarks view
                    var bookmarksView = new BookmarksView({ hash: 'ad45zad8d' });

                    // When we add 2 bookmarks
                    bookmarksView.collection.add(new Bookmark());
                    bookmarksView.collection.add(new Bookmark());

                    // It should render 2 bookmarks
                    bookmarksView.$el.find("li").should.have.length(2);

                    done();
                });
            });
        });
    });
}());