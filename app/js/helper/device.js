/*global define, Blob, FileReader, Worker, window, navigator*/
/*jslint regexp: true*/
define('helper/device', ['model/ebook'], function (EbookModel) {
    "use strict";

    var device = {
        scanSdCard: function (collection) {
            var cursor, sdcard;

            if (navigator && navigator.getDeviceStorage) {
                sdcard = navigator.getDeviceStorage('sdcard');

                // Let's browse all the ebooks available
                cursor = sdcard.enumerate();
                cursor.onsuccess = function () {
                    if (!this.done) {
                        var file = this.result;
                        if (file && !/\.Trashes/.test(file.name) && /.*\/[\w \-_]*\.epub$/.test(file.name)) {
                            device.addEbook(file, collection, this.continue.bind(this));
                        } else {
                            this.continue();
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

        addEbook: function (file, collection, callback) {
            var ebook = new EbookModel(), path, title;
            path = window.decodeURIComponent(file.name);
            if (!navigator.mozSetMessageHandler) {
                path = "books/" + path;
            }
            title = path.match(/\/([\w\-_\. ']*)\.epub$/);
            title = title ? title[1] : path;
            ebook.save({
                'title': title,
                'path': path,
                'size': file.size
            }, {
                'success': function () {
                    collection.add(ebook);
                    device.scanFile(file, ebook, function () {
                        callback(path);
                    }.bind(this));
                }.bind(this),
                'error': function (model, error) {
                    console.warn("Can't import " + model.get('path') + " :", error.target.error.message);
                    callback(path);
                }.bind(this)
            });
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