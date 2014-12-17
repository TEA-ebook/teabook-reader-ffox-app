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
        'template/bookcase/index',
        'template/bookcase/empty'
    ],

    function (Backbone, DeviceHelper, BooksSort, SettingCollection, HeaderBarView, FooterBarView, OptionsView, BookView, template, templateEmpty) {
        "use strict";

        var IndexView = Backbone.View.extend({

            tagName: "div",
            className: "bookcase",

            displayMode: "gallery",

            events: {
                "click .search-cancel": "fetchBooks",
                "click .add": "openPicker",
                "click .remove": "showDelete",
                "click .cancel": "showDelete",
                "click .confirm": "deleteSelectedBooks",
                "click .sort": "showOptions",
                "change input#book-upload": "handleFile",
                "keyup input[type=search]": "searchFor"
            },

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.close.bind(this));
                this.listenTo(Backbone, Teavents.SCAN_FINISHED, this.scanFinished.bind(this));

                this.ongoingScan = false;
                this.searchText = "";

                // We need the user display settings before rendering the books
                this.settings = new SettingCollection();
                this.settings.on("ready", this.render.bind(this));
                this.settings.on("update", this.sortBooks.bind(this));

                // UI components
                this.headerBar = new HeaderBarView();
                this.footerBar = new FooterBarView();
                this.optionsView = new OptionsView({ collection: this.settings });

                this.collection.on('destroy', this.checkEmptiness, this);
            },

            /**
             * Get books from indexedDB and sort it
             * If search is set : apply searchBooks on books fetched from indexedDB
             *
             * @param search (optionnal)
             */
            fetchBooks: function (search) {
                this.collection.fetch({
                    success: (search === undefined) ? this.sortBooks.bind(this) : function () {
                        this.searchBooks(search);
                    }.bind(this)
                });
                this.searchText = "";
            },

            setMode: function (mode) {
                this.booksEl.removeClass("cover");
                this.booksEl.removeClass("detail");
                this.booksEl.removeClass("empty");
                if (mode) {
                    this.booksEl.addClass(mode);
                    if (mode === "empty") {
                        this.$el.addClass(mode);
                        this.headerBar.$el.find("button").attr("disabled", "disabled");
                        this.footerBar.$el.find("button.remove").attr("disabled", "disabled");
                        this.footerBar.$el.find("button.sort").attr("disabled", "disabled");
                    } else {
                        this.$el.removeClass("empty");
                        this.headerBar.$el.find("button").removeAttr("disabled");
                        this.footerBar.$el.find("button.remove").removeAttr("disabled");
                        this.footerBar.$el.find("button.sort").removeAttr("disabled");
                    }
                }
            },

            /**
             * Sort books with user settings
             */
            sortBooks: function () {
                // display mode
                this.setMode(this.optionsView.settings.view);
                Backbone.trigger(Teavents.SCROLL_TOP);

                // books sort
                this.collection.comparator = BooksSort[this.optionsView.settings.sort];
                this.collection.sort();

                // display
                this.renderBooks();

                this.footerBar.clear();
            },

            /**
             * Full text search in book title and authors
             *
             * @param searchText
             */
            searchBooks: function (searchText) {
                var searchTokens, results;

                searchTokens = searchText.tokenize(2);

                results = this.collection.filter(function (book) {
                    var search = book.get('search');
                    return searchTokens.every(function (token) {
                        return search.indexOf(token) >= 0;
                    });
                });

                this.collection.reset(results);
                this.renderBooks();
            },

            /**
             *
             */
            checkEmptiness: function () {
                if (this.collection.isEmpty()) {
                    this.renderBooks();
                }
            },

            /**
             * UI render + books fetching
             */
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

            /**
             * Render books if any
             * Or a text to invite the user to add a book otherwise
             */
            renderBooks: function () {
                this.booksEl.html("");

                if (this.collection.isEmpty() && this.searchText.length === 0) {
                    this.setMode("empty");
                    this.booksEl.html(templateEmpty());
                    window.document.l10n.localizeNode(this.booksEl[0]);
                } else {
                    this.setMode(this.optionsView.settings.view);
                    this.collection.models.forEach(this.renderBook.bind(this));
                }
            },

            /**
             * @param model : a book
             */
            renderBook: function (model) {
                var book = new BookView({ "model": model });
                this.booksEl.append(book.el);
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

            /**
             * Open a file picker in Firefox OS
             * Or a hidden file input for desktop browsers
             */
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
                if (!this.booksEl.hasClass("selection")) {
                    this.booksEl.addClass("selection");
                    this.collection.forEach(function (book) {
                        book.set({ "selection": true }, { "silent": true });
                    });
                }
            },

            hideSelection: function () {
                if (this.booksEl.hasClass("selection")) {
                    this.booksEl.removeClass("selection");
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

            searchFor: function (event) {
                this.optionsView.hide();
                var text = event.target.value.trim().toLowerCase().removeDiacritics();
                if (text.length > 0) {
                    if (text !== this.searchText) {
                        this.fetchBooks(text);
                        this.searchText = text;
                    }
                } else {
                    this.fetchBooks();
                }
            },

            close: function () {
                this.stopListening(this.collection);
                this.remove();
            }
        });
        return IndexView;
    });