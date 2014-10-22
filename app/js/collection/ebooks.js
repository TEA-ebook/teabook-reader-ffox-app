/*global define: true, navigator: true*/
define("collection/ebooks", ["backbone", "model/ebook"], function (Backbone, EbookModel) {
    "use strict";

    var EbookCollection = Backbone.Collection.extend({

        model: EbookModel,

        fetch: function () {
            var ebooks = [],
                ebookFiles,
                cursor,
                collection;

            if (navigator && navigator.getDeviceStorage) {
                ebookFiles = navigator.getDeviceStorage('sdcard');

                // Let's browse all the images available
                cursor = ebookFiles.enumerate("books");

                collection = this;
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
                    } else {
                        collection.reset(ebooks);
                    }
                };

                cursor.onerror = function () {
                    console.warn("No ebook file found: " + this.error);
                };
            } else {
                console.warn("You have no SD card access");
            }
        }
    });

    return EbookCollection;
});