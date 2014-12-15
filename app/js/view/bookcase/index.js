/*global define, window, navigator, Teavents, MozActivity*/
define('view/bookcase/index',
    [
        'backbone',
        'helper/device',
        'helper/books-sort',
        'collection/settings',
        'view/bookcase/headerbar',
        'view/bookcase/footerbar',
        'view/bookcase/options',
        'view/bookcase/book',
        'template/bookcase/index'
    ],

    function (Backbone, DeviceHelper, BooksSort, SettingCollection, HeaderBarView, FooterBarView, OptionsView, BookView, template) {
        "use strict";

        var IndexView = Backbone.View.extend({

            tagName: "div",
            className: "bookcase",

            displayMode: "gallery",

            events: {
                "click .search": "scanSdCard",
                "click .add": "openPicker",
                "click .remove": "showDelete",
                "click .cancel": "showDelete",
                "click .confirm": "deleteSelectedBooks",
                "click .sort": "showOptions",
                "change input#book-upload": "handleFile"
            },

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.close.bind(this));
                this.listenTo(Backbone, Teavents.SCAN_FINISHED, this.scanFinished.bind(this));

                this.ongoingScan = false;

                this.settings = new SettingCollection();
                this.settings.on("ready", this.render.bind(this));
                this.settings.on("update", this.sortBooks.bind(this));

                // UI components
                this.headerBar = new HeaderBarView();
                this.footerBar = new FooterBarView();
                this.optionsView = new OptionsView({ collection: this.settings });
            },

            fetchBooks: function () {
                this.collection.fetch({
                    success: this.sortBooks.bind(this)
                });
            },

            sortBooks: function () {
                // display mode
                this.booksEl.removeClass("cover");
                this.booksEl.removeClass("detail");
                this.booksEl.addClass(this.optionsView.settings.view);
                window.scrollTo(0, 0);

                // books sort
                this.collection.comparator = BooksSort[this.optionsView.settings.sort];
                this.collection.sort();

                // display
                this.renderBooks();

                this.footerBar.clear();
            },

            render: function () {
                this.headerBar.render();
                this.$el.html(this.headerBar.el);

                this.footerBar.render();
                this.$el.append(this.footerBar.el);

                this.optionsView.render();
                this.$el.append(this.optionsView.el);

                this.$el.append(template(this.optionsView.settings));
                this.booksEl = this.$el.find(".books");

                this.fetchBooks();

                window.document.l10n.localizeNode(this.el);
            },

            renderBooks: function () {
                this.booksEl.html("");
                this.collection.models.forEach(this.renderBook.bind(this));
            },

            renderBook: function (model) {
                var book = new BookView({ "model": model });
                this.$el.find('.books').append(book.el);
            },

            handleFile: function (event) {
                var file, files;

                if (window.MozActivity && event.target instanceof window.MozActivity) {
                    file = event.target.result.blob;
                } else {
                    files = event.target.files;
                    if (files && files.length > 0) {
                        file = files[0];
                    }
                }

                if (file) {
                    this.collection.on('add', this.renderBooks.bind(this));
                    DeviceHelper.addBook(file, this.collection, function (path) {
                        console.info(path + " was successfully uploaded");
                        this.$el.find("input#book-upload").val("");
                        this.collection.off('add');
                    }.bind(this));
                }
            },

            scanSdCard: function () {
                if (!this.ongoingScan) {
                    this.ongoingScan = true;
                    this.collection.on('add', this.renderBooks.bind(this));
                    DeviceHelper.scanSdCard(this.collection);
                }
            },

            openPicker: function () {
                this.footerBar.clear();
                this.optionsView.hide();
                this.hideSelection();
                if (window.MozActivity) {
                    var activity = new MozActivity({
                        name: "pick",
                        data: {
                            type: "application/epub+zip"
                        }
                    });

                    activity.onsuccess = this.handleFile.bind(this);

                    activity.onerror = function () {
                        console.warn(this.error);
                    };
                } else {
                    this.$el.find("input[type='file']").click();
                }
            },

            scanFinished: function () {
                this.ongoingScan = false;
                this.collection.off('add');
            },

            showOptions: function () {
                if (this.optionsView.toggle()) {
                    this.hideSelection();
                    this.footerBar.showSort();
                } else {
                    this.footerBar.hideSort();
                }
            },

            showDelete: function () {
                if (this.footerBar.toggleDelete()) {
                    this.optionsView.hide();
                    this.showSelection();
                } else {
                    this.hideSelection();
                }
            },

            showSelection: function () {
                var booksEl = this.$el.find(".books");

                if (!booksEl.hasClass("selection")) {
                    booksEl.addClass("selection");
                    this.collection.forEach(function (book) {
                        book.set({ "selection": true }, { "silent": true });
                    });
                }
            },

            hideSelection: function () {
                var booksEl = this.$el.find(".books");

                if (booksEl.hasClass("selection")) {
                    booksEl.removeClass("selection");
                    this.collection.forEach(function (book) {
                        book.set({ "selection": false }, { "silent": true });
                    });
                }
            },

            deleteSelectedBooks: function () {
                var toDelete = [], i;
                this.collection.forEach(function (book) {
                    if (book && book.has('selected') && book.get('selected')) {
                        toDelete.push(book);
                    }
                });
                for (i = 0; i < toDelete.length; i += 1) {
                    toDelete[i].destroy({ silent: true });
                }
                this.hideSelection();
                this.footerBar.hideDelete();
            },

            resetBookcase: function () {
                Backbone.sync("delete", this.collection, {
                    success: function () {
                        this.collection.reset();
                    }.bind(this)
                });
            },

            close: function () {
                this.stopListening(this.collection);
                this.remove();
            }
        });
        return IndexView;
    });