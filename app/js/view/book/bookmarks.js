/*global define, window, Teavents*/
/*jslint unparam: true*/
define('view/book/bookmarks', ['backbone', 'model/bookmark', 'collection/bookmarks', 'view/book/bookmark', 'template/book/bookmarks'],
    function (Backbone, BookmarkModel, BookmarkCollection, BookmarkView, template) {
        "use strict";

        var BookmarksView = Backbone.View.extend({

            tagName: 'div',
            className: 'panel ebook-bookmarks hidden',

            events: {
                "click button": "bookmarkPage"
            },

            initialize: function (options) {
                this.hash = options.hash;
                this.render();
                this.collection = new BookmarkCollection();
                this.collection.on("add", this.renderBookmark, this);
                this.collection.fetch({
                    conditions: { hash: options.hash }
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
                bookmarkView.render(this.hash);
                this.bookmarksEl.append(bookmarkView.el);
                this.sortList();
            },

            bookmarkPage: function (event) {
                event.stopImmediatePropagation();
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
            },

            sortList: function () {
                var parent = this.$el.find("ul");
                parent.find("li").detach().sort(function (a, b) {
                    return (a.getAttribute('data-rank') - b.getAttribute('data-rank'));
                }).each(function (index, el) {
                    parent.append(el);
                });
                return this;
            }
        });

        return BookmarksView;
    });