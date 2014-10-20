define("collection/ebooks", ["backbone", "model/ebook"], function (Backbone, EbookModel) {
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