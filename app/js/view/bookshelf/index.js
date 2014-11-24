/*global define: true, navigator: true, Worker: true, FileReader: true, window: true*/
define('view/bookshelf/index', ['backbone', 'model/ebook', 'view/bookshelf/book', 'template/bookshelf/index'],
    function (Backbone, EbookModel, ShelfBookView, bookshelfTemplate) {
        "use strict";

        var IndexView = Backbone.View.extend({

            tagName: "div",
            className: "shelf",

            events: {
                "click .shelf-scan": "scanSdCard",
                "click .shelf-reset": "resetDb"
            },

            initialize: function () {
                this.listenTo(Backbone, 'destroy', this.close.bind(this));

                this.initShelves();

                this.render();

                this.collection.on("add", this.renderEbook, this);
                this.collection.on("reset", this.render, this);
                this.collection.fetch();
            },

            initShelves: function () {
                this.shelves = [];

                var i = 0;
                for (i; i < 5; i += 1) {
                    this.generateNewShelf(3);
                }
            },

            render: function () {
                this.$el.html(bookshelfTemplate({
                    shelves: this.shelves
                }));
                return this;
            },

            renderEbook: function (model) {
                var shelfBook = new ShelfBookView({
                    "model": model
                }), shelf = this.findFreeShelfTab();

                if (shelf) {
                    this.$el.find("div#shelf-" + shelf.id).append(shelfBook.el);
                    shelf.books.push(model);
                }
            },

            generateNewShelf: function (size) {
                this.shelves.push({
                    id: this.shelves.length,
                    size: size,
                    books: []
                });
            },

            findFreeShelfTab: function () {
                var freeShelves = this.shelves.filter(function (shelf) {
                    return (shelf.size - shelf.books.length) > 0;
                });
                if (freeShelves.length > 0) {
                    return freeShelves[0];
                }
                return false;
            },

            scanSdCard: function () {
                var ebook, cursor, indexView, sdcard;

                if (navigator && navigator.getDeviceStorage) {
                    sdcard = navigator.getDeviceStorage('sdcard');

                    // Let's browse all the ebooks available
                    indexView = this;
                    cursor = sdcard.enumerate("books");
                    cursor.onsuccess = function () {
                        if (!this.done) {
                            var file = this.result;
                            if (file) {
                                ebook = new EbookModel();
                                ebook.save({
                                    title: file.name,
                                    path: file.name,
                                    size: file.size
                                }, {
                                    success: function () {
                                        indexView.collection.add(ebook);
                                        indexView.scanFile(file, ebook, function () {
                                            this.continue();
                                        }.bind(this));
                                    }.bind(this),
                                    error: function (model, error) {
                                        console.error(model, error);
                                    }
                                });
                            }
                        }
                    };

                    cursor.onerror = function () {
                        console.warn("No ebook file found: " + this.error);
                    };
                } else {
                    console.warn("You have no SD card access");
                }
            },

            scanFile: function (file, ebook, callback) {
                var reader, importBookWorker;

                reader = new FileReader();
                reader.onload = function (e) {
                    importBookWorker = new Worker("importBook.js");
                    importBookWorker.postMessage(e.target.result);
                    importBookWorker.onmessage = function (event) {
                        console.dir(event.data);
                        ebook.set({
                            title: event.data.title,
                            cover: event.data.cover,
                            author: event.data.author
                        });
                        ebook.save(null, { success: callback });
                    };
                };
                reader.readAsArrayBuffer(file);
            },

            resetDb: function () {
                Backbone.sync("delete", this.collection, {
                    success: function () {
                        this.initShelves();
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