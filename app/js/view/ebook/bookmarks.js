/*global define, window, Teavents*/
define('view/ebook/bookmarks', ['backbone', 'model/bookmark', 'collection/bookmarks', 'view/ebook/bookmark', 'template/ebook/bookmarks'],
    function (Backbone, BookmarkModel, BookmarkCollection, BookmarkView, template) {
        "use strict";

        var BookmarksView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-bookmarks hidden',

            events: {
                "click button": "bookmarkPage"
            },

            initialize: function (options) {
                this.uri = options.path;
                this.render();
                this.collection = new BookmarkCollection();
                this.collection.on("add", this.renderBookmark, this);
                this.collection.fetch({
                    conditions: { path: options.path }
                });
            },

            render: function () {
                this.$el.html(template());
                window.document.l10n.localizeNode(this.el);
                this.bookmarksEl = this.$el.find('ul');
                return this;
            },

            renderBookmark: function (bookmark) {
                var bookmarkView = new BookmarkView({ model: bookmark });
                bookmarkView.render(window.encodeURIComponent(this.uri));
                this.bookmarksEl.append(bookmarkView.el);
            },

            bookmarkPage: function () {
                Backbone.trigger(Teavents.Actions.BOOKMARK_PAGE);
            },

            saveBookmark: function (bookmarkData) {
                if (!this.collection.findWhere(bookmarkData)) {
                    var bookmark = new BookmarkModel(bookmarkData);
                    this.collection.add(bookmark);
                    bookmark.save();
                }
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    return this.show();
                }
                return this.hide();
            },

            show: function () {
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                return false;
            }
        });

        return BookmarksView;
    });