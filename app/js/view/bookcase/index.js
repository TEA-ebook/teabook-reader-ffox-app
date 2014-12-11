/*global define, window, Teavents, MozActivity*/
define('view/bookcase/index',
    [
        'backbone',
        'helper/device',
        'collection/settings',
        'view/bookcase/headerbar',
        'view/bookcase/footerbar',
        'view/bookcase/options',
        'view/bookcase/book',
        'template/bookcase/index'
    ],

    function (Backbone, DeviceHelper, SettingCollection, HeaderBarView, FooterBarView, OptionsView, BookView, template) {
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
                this.options = new OptionsView({ collection: this.settings });

                this.fetchBooks();
            },

            fetchBooks: function () {
                this.collection.on("add", this.renderBook, this);
                this.collection.on("reset", this.render, this);
                this.collection.fetch();
            },

            sortBooks: function () {
                var booksEl = this.$el.find(".books");
                booksEl.removeClass("cover");
                booksEl.removeClass("detail");
                booksEl.addClass(this.options.settings.view);
                window.scrollTo(0, 0);
                this.footerBar.clear();
            },

            render: function () {
                this.headerBar.render();
                this.$el.html(this.headerBar.el);

                this.footerBar.render();
                this.$el.append(this.footerBar.el);

                this.options.render();
                this.$el.append(this.options.el);

                console.debug(this.options.settings);
                this.$el.append(template(this.options.settings));

                window.document.l10n.localizeNode(this.el);
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
                    DeviceHelper.addBook(file, this.collection, function (path) {
                        console.info(path + " was successfully uploaded");
                        this.$el.find("input#book-upload").val("");
                        //Backbone.history.navigate("book/" + path.hashCode(), true);
                    }.bind(this));
                }
            },

            scanSdCard: function () {
                if (!this.ongoingScan) {
                    this.ongoingScan = true;
                    DeviceHelper.scanSdCard(this.collection);
                }
            },

            openPicker: function () {
                this.footerBar.clear();
                this.options.hide();
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
            },

            showOptions: function () {
                if (this.options.toggle()) {
                    this.hideSelection();
                    this.footerBar.showSort();
                } else {
                    this.footerBar.hideSort();
                }
            },

            showDelete: function () {
                if (this.footerBar.toggleDelete()) {
                    this.options.hide();
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
                this.toggleDelete();
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