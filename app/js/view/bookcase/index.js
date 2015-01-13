/*global define, window, navigator, Teavents, MozActivity*/
define('view/bookcase/index',
    [
        'backbone',
        'underscore',
        'helper/device',
        'helper/books-sort',
        'helper/logger',
        'collection/settings',
        'view/bookcase/headerbar',
        'view/bookcase/footerbar',
        'view/bookcase/options',
        'view/bookcase/book',
        'view/bookcase/added-books',
        'template/bookcase/index',
        'template/bookcase/empty'
    ],

    function (Backbone,
              underscore,
              DeviceHelper,
              BooksSort,
              Logger,
              SettingCollection,
              HeaderBarView,
              FooterBarView,
              OptionsView,
              BookView,
              AddedBooksView,
              template,
              templateEmpty) {
        "use strict";

        var IndexView = Backbone.View.extend({

            tagName: "div",
            className: "bookcase",

            displayMode: "gallery",

            events: {
                "click .search-cancel": "fetchBooks",
                "click .menu": "showDrawer",
                "click .add": "openPicker",
                "click .remove": "showDelete",
                "click .cancel": "showDelete",
                "click .confirm": "deleteSelectedBooks",
                "click .sort": "showOptions",
                "click .book": "openBookEffect",
                "change input#book-upload": "handleFiles",
                "keyup input[type=search]": "searchFor"
            },

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.close.bind(this));

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

            /**
             *
             * @param mode
             */
            setMode: function (mode) {
                this.booksEl.removeClass("cover");
                this.booksEl.removeClass("detail");
                this.booksEl.removeClass("empty");
                if (mode) {
                    this.booksEl.addClass(mode);
                    if (mode === "empty") {
                        this.$el.addClass(mode);
                        this.headerBar.$el.find("button.search-display").attr("disabled", "disabled");
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
                    return search ? searchTokens.every(function (token) {
                        return search.indexOf(token) >= 0;
                    }) : false;
                });

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.SEARCH, { search: searchText });

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

                // need to invert event bubbling direction :
                // capture click on the entire view if the drawer is dsplayed in order to close it
                this.el.addEventListener("click", this.hideDrawer.bind(this), true);

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
                    Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.EMPTY_BOOKCASE);
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

            /**
             * Handle file(s) form file picker : add book(s) to bookcase
             *
             * @param event
             */
            handleFiles: function (event) {
                var files, nbSelectedFiles = 0, nbProcessedFiles = 0, addedBooks = [];

                if (window.MozActivity && event.target instanceof window.MozActivity) {
                    files = event.target.result.files;
                } else {
                    files = event.target.files;
                }

                if (files) {
                    nbSelectedFiles = files.length;
                    this.collection.on('add', this.renderBooks.bind(this));
                    underscore.each(files, function (file) {
                        if (/\.epub$/.test(file.name)) {
                            DeviceHelper.addBookToBookcase(file, this.collection, function (book) {
                                if (book.get('id') !== undefined) {
                                    addedBooks.push(book);
                                    console.info(book.get('title') + " was successfully uploaded");
                                }
                                nbProcessedFiles += 1;
                                if (nbProcessedFiles === nbSelectedFiles) {
                                    this.collection.off('add');
                                    this.renderAddedBooks(addedBooks);
                                }
                            }.bind(this));
                        } else {
                            nbSelectedFiles -= 1;
                        }
                    }.bind(this));

                    this.$el.find("input#book-upload").val("");
                }
            },

            /**
             * Display a popup with added books covers
             *
             * @param books
             */
            renderAddedBooks: function (addedBooks) {
                if (addedBooks.length > 0) {
                    this.addedBooksView = new AddedBooksView();
                    this.addedBooksView.render(addedBooks);
                    this.$el.append(this.addedBooksView.el);
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

                    activity.onsuccess = this.handleFiles.bind(this);

                    activity.onerror = function () {
                        console.warn(this.error);
                    };
                } else {
                    this.$el.find("input[type='file']").click();
                }
            },

            openBookEffect: function () {
                this.$el.addClass("open");
            },

            showDrawer: function (event) {
                event.stopImmediatePropagation();
                if (this.$el.hasClass("withDrawer")) {
                    this.$el.removeClass("withDrawer");
                } else {
                    this.$el.addClass("withDrawer");
                    Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.SHOW_DRAWER);
                }
            },

            hideDrawer: function (event) {
                if (this.$el.hasClass("withDrawer")) {
                    event.stopImmediatePropagation();
                    this.$el.removeClass("withDrawer");
                }
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
                    Logger.deleteBook(toDelete[i].attributes);
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
                if (text.length > 1) {
                    if (text !== this.searchText) {
                        this.fetchBooks(text);
                        this.searchText = text;
                    }
                } else if ((text.length === 0) && this.searchText.length > 0) {
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