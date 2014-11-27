/*global define, window*/
define('view/bookshelf/index', ['backbone', 'helper/device', 'view/bookshelf/book', 'template/bookshelf/index'],
    function (Backbone, DeviceHelper, ShelfBookView, bookshelfTemplate) {
        "use strict";

        var IndexView = Backbone.View.extend({

            tagName: "div",
            className: "shelf",

            events: {
                "click .shelf-scan": "scanSdCard",
                "click .shelf-reset": "resetShelf",
                "change input#ebook-upload": "handleFile"
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
                for (i; i < 10; i += 1) {
                    this.generateNewShelf(3);
                }
            },

            render: function () {
                this.$el.html(bookshelfTemplate({
                    shelves: this.shelves
                }));
                window.document.l10n.localizeNode(this.el);
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

            handleFile: function (event) {
                var files = event.target.files, file;
                if (files && files.length > 0) {
                    file = files[0];
                    DeviceHelper.addEbook(file, this.collection, function (path) {
                        console.info(path + " was successfully uploaded");
                        this.$el.find("input#ebook-upload").val("");
                        Backbone.history.navigate("ebook/" + window.encodeURIComponent(path), true);
                    }.bind(this));
                }
            },

            scanSdCard: function () {
                DeviceHelper.scanSdCard(this.collection);
            },

            resetShelf: function () {
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