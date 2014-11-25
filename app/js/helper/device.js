/*global define, Blob, FileReader, Worker, navigator*/
define('helper/device', ['model/ebook'], function (EbookModel) {
    "use strict";

    var device = {
        scanSdCard: function (collection) {
            var ebook, cursor, sdcard;

            if (navigator && navigator.getDeviceStorage) {
                sdcard = navigator.getDeviceStorage('sdcard');

                // Let's browse all the ebooks available
                cursor = sdcard.enumerate("books");
                cursor.onsuccess = function () {
                    if (!this.done) {
                        var file = this.result;
                        if (file) {
                            ebook = new EbookModel();
                            ebook.save({
                                'title': file.name,
                                'path': file.name,
                                'size': file.size
                            }, {
                                'success': function () {
                                    collection.add(ebook);
                                    device.scanFile(file, ebook, function () {
                                        this.continue();
                                    }.bind(this));
                                }.bind(this),
                                'error': function (model, error) {
                                    console.warn("Can't import " + model.get('path') + " :", error.target.error.message);
                                    this.continue();
                                }.bind(this)
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
                    // set metadata extracted from epub in the model
                    ebook.set(event.data);
                    ebook.save(null, {
                        'success': callback,
                        'error': callback
                    });
                };
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return device;
});