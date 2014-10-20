
;curl(["router"], function(AppRouter) {
        new AppRouter();
    }
);

;define('model/ebook', ['backbone'], function (Backbone) {
    "use strict";

    var EbookModel = Backbone.Model.extend();

    return EbookModel;
});

;define('view/shelfBook', ['backbone', 'template/shelfBook'], function (Backbone, shelfBookTemplate) {

    var ShelfBookView = Backbone.View.extend({

        tagName: "div",
        className: "ebook",

        events: {
            "click": "open"
        },

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.appendChild(shelfBookTemplate(this.model.attributes));
        },

        open: function (event) {
            console.log(event);
        }

    });

    return ShelfBookView;
});

;define('collection/ebooks', ['backbone', 'model/ebook'], function (Backbone, EbookModel) {
    "use strict";

    var EbookCollection = Backbone.Collection.extend({

        model: EbookModel,

        fetch: function () {
            var ebooks = [];
            if (navigator && navigator.getDeviceStorage) {
                var ebookFiles = navigator.getDeviceStorage('sdcard');

                // Let's browse all the images available
                var cursor = ebookFiles.enumerate("books");

                var collection = this;
                cursor.onsuccess = function () {
                    var file = this.result;
                    if (file) {
                        ebooks.push(new EbookModel({
                            name: file.name,
                            size: file.size
                        }));
                    }

                    if (!this.done) {
                        this.continue();
                    }
                    else {
                        collection.reset(ebooks);
                    }
                };

                cursor.onerror = function () {
                    console.warn("No ebook file found: " + this.error);
                };
            }
            else {
                console.warn("You have no SD card access");
                for(var i = 0; i < 10; i++) {
                    ebooks.push(new EbookModel({
                        name: "FakeFile-" + i,
                        size: 0
                    }));
                }
                this.reset(ebooks);
            }
        }
    });

    return EbookCollection;
});

;define('view/shelf', ['backbone', 'collection/ebooks', 'view/shelfBook', 'template/shelf'], function (Backbone, EbookCollection, ShelfBookView, shelfTemplate) {

        var ShelfView = Backbone.View.extend({

                el: "#content",

                initialize: function () {
                    this.collection.on("reset", this.render, this);
                    this.collection.fetch();
                },

                render: function () {
                    this.$el.html(shelfTemplate());
                    this.collection.each(this.renderEbook, this);
                },

                renderEbook: function (model) {
                    new ShelfBookView({
                        "el": this.el,
                        "model": model
                    });
                    console.debug("render ebook");
                }
            }
        );
        return ShelfView;
    }
);

;define('router', ['backbone', 'collection/ebooks', 'view/shelf'], function (Backbone, EbookCollection, ShelfView) {
    "use strict";

    var AppRouter = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start({ pushState: false, root: "/" });
        },

        routes: {
            '': 'bookShelf',
            'test': 'test'
        },

        bookShelf: function() {
            console.debug("shelf route activated");
            new ShelfView({ collection: new EbookCollection() });
        },

        test: function() {
            console.debug("Test route activated");
        }
    });

    return AppRouter;
});
