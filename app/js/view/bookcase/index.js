/*global define, window, Teavents, MozActivity*/
define('view/bookcase/index', ['backbone', 'helper/device', 'view/bookcase/headerbar', 'view/bookcase/footerbar', 'view/bookcase/book', 'template/bookcase/index'],
    function (Backbone, DeviceHelper, HeaderBarView, FooterBarView, BookView, template) {
        "use strict";

        var IndexView = Backbone.View.extend({

            tagName: "div",
            className: "bookcase",

            displayMode: "gallery",

            events: {
                "click .search": "scanSdCard",
                "click .add": "openPicker",
                "click .remove": "resetBookcase",
                "click .sort": "toggleSort",
                "change input#book-upload": "handleFile"
            },

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.close.bind(this));
                this.listenTo(Backbone, Teavents.SCAN_FINISHED, this.scanFinished.bind(this));

                this.ongoingScan = false;

                // UI components
                this.headerBar = new HeaderBarView();
                this.footerBar = new FooterBarView();

                this.render();

                // Books from DB
                this.collection.on("add", this.renderBook, this);
                this.collection.on("reset", this.render, this);
                this.collection.fetch();
            },

            render: function () {
                this.headerBar.render();
                this.$el.html(this.headerBar.el);

                this.footerBar.render();
                this.$el.append(this.footerBar.el);

                this.$el.append(template({ 'displayMode': this.displayMode }));

                window.document.l10n.localizeNode(this.el);
            },

            renderBook: function (model) {
                var book = new BookView({ "model": model });
                this.$el.find('.books').append(book.el);
            },

            handleFile: function (event) {
                var file, files;

                if (event.target instanceof MozActivity) {
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
                        Backbone.history.navigate("book/" + path.hashCode(), true);
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
            },

            scanFinished: function () {
                this.ongoingScan = false;
            },

            toggleSort: function () {
                var booksEl = this.$el.find(".books");
                if (booksEl.hasClass("gallery")) {
                    booksEl.removeClass("gallery");
                    booksEl.addClass("list");
                } else {
                    booksEl.removeClass("list");
                    booksEl.addClass("gallery");
                }
                window.scrollTo(0, 0);
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