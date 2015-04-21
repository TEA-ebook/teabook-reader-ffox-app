/*global define, window, navigator, Teavents, MozActivity, alert*/
/*jslint stupid: true*/
define('view/bookcase/index',
    [
        'backbone',
        'underscore',
        'hammer',
        'helper/device',
        'helper/books-sort',
        'helper/logger',
        'collection/settings',
        'view/bookcase/headerbar',
        'view/bookcase/footerbar',
        'view/bookcase/options',
        'view/bookcase/book',
        'view/bookcase/added-books',
        'view/bookcase/downloading-books',
        'view/bookcase/notification',
        'template/bookcase/index',
        'template/bookcase/empty'
    ],

    function (Backbone,
              underscore,
              Hammer,
              DeviceHelper,
              BooksSort,
              Logger,
              SettingCollection,
              HeaderBarView,
              FooterBarView,
              OptionsView,
              BookView,
              AddedBooksView,
              DownloadingBooksView,
              NotificationView,
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
                "click .bookcase-empty-download": "downloadBooks",
                "change input#book-upload": "handleFiles",
                "keyup input[type=search]": "searchFor",
                "touchmove": "noSlide"
            },

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.close.bind(this));

                this.searchText = "";
                this.importing = false;

                // We need the user display settings before rendering the books
                this.settings = new SettingCollection();
                this.settings.on("ready", this.render.bind(this));
                this.settings.on("update", this.sortBooks.bind(this));

                // UI components
                this.headerBar = new HeaderBarView();
                this.footerBar = new FooterBarView();
                this.optionsView = new OptionsView({ collection: this.settings });
                this.notificationView = new NotificationView();

                // SD card availability events
                Backbone.on(Teavents.SDCARD_AVAILABLE, this.hideNotification.bind(this));
                Backbone.on(Teavents.SDCARD_UNAVAILABLE, this.showNotification.bind(this));

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
                        this.freezeUiButtons();
                    } else {
                        this.$el.removeClass("empty");
                        if (!this.importing) {
                            this.unfreezeUiButtons();
                        }
                    }
                }
            },

            /**
             *
             */
            freezeUiButtons: function (all) {
                this.headerBar.$el.find("button.search-display").attr("disabled", "disabled");
                this.footerBar.$el.find("button.remove").attr("disabled", "disabled");
                this.footerBar.$el.find("button.sort").attr("disabled", "disabled");

                if (all) {
                    this.footerBar.$el.find("button.add").attr("disabled", "disabled");
                }
            },

            /**
             *
             */
            unfreezeUiButtons: function () {
                this.headerBar.$el.find("button").removeAttr("disabled");
                this.footerBar.$el.find("button").removeAttr("disabled");
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

                // Handle long press on books to activate delete mode
                var hammertime = new Hammer(this.el, { prevent_mouseevents: true });
                hammertime.on("press", this.showDelete.bind(this));

                // need to invert event bubbling direction :
                // capture click on the entire view if the drawer is dsplayed in order to close it
                this.el.addEventListener("click", this.hideDrawer.bind(this), true);

                // prevent Gaia from displaying an ugly context menu above the UI
                this.el.addEventListener("contextmenu", function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }, false);

                window.document.l10n.localizeNode(this.el);

                // display alert notification if sd card is unavailable
                DeviceHelper.checkSdCardAvailability(this.hideNotification.bind(this), this.showNotification.bind(this));
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
                var files;

                if (window.MozActivity && event.target instanceof window.MozActivity) {
                    files = event.target.result.files;
                } else {
                    files = event.target.files;
                }

                if (files) {
                    this.importing = true;
                    this.freezeUiButtons(true);
                    this.collection.on('add', this.renderBooks.bind(this));
                    this.handleFile(underscore.toArray(files), []);
                    this.$el.find("input#book-upload").val("");
                }
            },

            /**
             * Handle one file and import it
             *
             * @param files
             * @param addedBooks
             */
            handleFile: function (files, addedBooks) {
                var file = files.shift();

                if (file) {
                    if (/\.epub$/.test(file.name)) {
                        DeviceHelper.addBookToBookcase(file, this.collection, function (book) {
                            if (book) {
                                if (book.get('id') !== undefined) {
                                    addedBooks.push(book);
                                    this.updateImportedBooks(addedBooks.length);
                                    console.info(book.get('title') + " was successfully uploaded");
                                }

                                // pass to the next file
                                this.handleFile(files, addedBooks);
                            }
                        }.bind(this), function (error) {
                            console.warn(error);

                            // current file failed, pass to the next file
                            this.handleFile(files, addedBooks);
                        }.bind(this));
                    } else { // current file is not an epub, pass to the next file
                        this.handleFile(files, addedBooks);
                    }
                } else { // no more file, import ended
                    this.collection.off('add');
                    this.renderAddedBooks(addedBooks);
                    this.removeDownloadingBooks();
                    this.importing = false;
                    this.unfreezeUiButtons();
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
             * Display a popup with downlading books status
             *
             * @param books
             */
            renderDownloadingBooks: function (files) {
                if (files.length > 0) {
                    this.downloadingBooksView = new DownloadingBooksView();
                    this.downloadingBooksView.render(files.length);
                    this.$el.append(this.downloadingBooksView.el);
                }
            },

            /**
             *
             */
            removeDownloadingBooks: function () {
                if (this.downloadingBooksView) {
                    this.downloadingBooksView.remove();
                    this.downloadingBooksView = null;
                }
            },

            /**
             *
             * @param number
             */
            updateImportedBooks: function (number) {
                if (this.downloadingBooksView) {
                    this.downloadingBooksView.updateImported(number);
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
                            type: "application/epub+zip",
                            exclude: this.collection.models.map(function (book) {
                                return book.get('path');
                            })
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

            /**
             *
             */
            openBookEffect: function () {
                if (!this.booksEl.hasClass("selection")) {
                    this.$el.addClass("open");
                } else {
                    this.updateHeaderbar();
                }
            },

            /**
             *
             * @param event
             */
            showDrawer: function (event) {
                event.stopImmediatePropagation();
                if (this.$el.hasClass("withDrawer")) {
                    this.$el.removeClass("withDrawer");
                } else {
                    this.$el.addClass("withDrawer");
                    Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.SHOW_DRAWER);
                }
            },

            /**
             *
             * @param event
             */
            hideDrawer: function (event) {
                if (this.$el.hasClass("withDrawer")) {
                    event.stopImmediatePropagation();
                    this.$el.removeClass("withDrawer");
                }
            },

            /**
             *
             */
            showOptions: function () {
                if (this.optionsView.toggle()) {
                    this.hideSelection();
                    this.footerBar.showSort();
                } else {
                    this.footerBar.hideSort();
                }
            },

            /**
             *
             */
            showDelete: function () {
                if (this.footerBar.toggleDelete()) {
                    this.optionsView.hide();
                    this.showSelection();
                } else {
                    this.hideSelection();
                    this.headerBar.reset();
                }
            },

            /**
             *
             */
            showSelection: function () {
                if (!this.booksEl.hasClass("selection")) {
                    this.booksEl.addClass("selection");
                    this.collection.forEach(function (book) {
                        book.set({ "selection": true }, { "silent": true });
                    });
                    this.updateHeaderbar();
                }
            },

            /**
             *
             */
            hideSelection: function () {
                if (this.booksEl.hasClass("selection")) {
                    this.booksEl.find('input:checked + label').click();
                    this.booksEl.removeClass("selection");
                    this.collection.forEach(function (book) {
                        book.set({ "selection": false }, { "silent": true });
                    });
                    this.headerBar.reset();
                }
            },

            /**
             *
             */
            updateHeaderbar: function () {
                this.headerBar.selectionMode(this.booksEl.find("input[type='checkbox']:checked").length);
            },

            /**
             *
             */
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

            /**
             *
             * @param event
             */
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

            /**
             * SD card unavailable notification
             */
            showNotification: function () {
                if (!this.importing) {
                    this.notificationView.render(window.document.l10n.getSync('sdCardUnavailableNotif'));
                    this.$el.append(this.notificationView.el);
                }
            },

            /**
             *
             */
            downloadBooks: function () {
                DeviceHelper.getOfferedBookList(navigator.language, function (list) {
                    if (list.length > 0) {
                        this.importing = true;
                        this.freezeUiButtons(true);
                        this.collection.on('add', this.renderBooks.bind(this));
                        this.renderDownloadingBooks(list);
                        this.downloadBook(list, []);
                    } else {
                        alert(window.navigator.onLine ? window.document.l10n.getSync('downloadError') : window.document.l10n.getSync('noInternetConnection'));
                    }
                }.bind(this));
            },

            /**
             *
             * @param list
             * @param files
             */
            downloadBook: function (list, files) {
                if (list.length > 0) {
                    // download books one by one
                    DeviceHelper.downloadBook(list.shift(), function (file) {
                        files.push(file);
                        this.nextDownload(list, files);
                    }.bind(this), function (error) {
                        console.warn("Book download failed", error);
                        this.nextDownload(list, files);
                    }.bind(this));
                } else {
                    // import them
                    this.handleFile(files, []);
                }
            },

            /**
             *
             * @param list
             * @param files
             */
            nextDownload: function (list, files) {
                this.downloadingBooksView.updateDownloaded(files.length);
                this.downloadBook(list, files);
            },

            /**
             *
             */
            hideNotification: function () {
                this.notificationView.remove();
                this.fetchBooks();
            },

            /**
             *
             * @param event
             */
            noSlide: function (event) {
                if (this.$el.hasClass("withDrawer")) {
                    event.preventDefault();
                }
            },

            /**
             *
             */
            close: function () {
                this.stopListening(this.collection);

                Backbone.off(Teavents.SDCARD_AVAILABLE);
                Backbone.off(Teavents.SDCARD_UNAVAILABLE);

                this.remove();
            }
        });
        return IndexView;
    });