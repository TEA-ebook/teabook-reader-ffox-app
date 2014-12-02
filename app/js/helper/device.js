/*global define, Blob, FileReader, Worker, window, navigator, Uint8Array, Teavents*/
/*jslint regexp: true, unparam: true*/
define('helper/device', ['backbone', 'model/ebook', 'helper/resizer'], function (Backbone, EbookModel, Resizer) {
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
                        if (file && !/\.Trashes/.test(file.name) && /.*\/[\w\-_\., ']*\.epub$/.test(file.name)) {
                            device.addEbook(file, collection, this.continue.bind(this));
                        } else {
                            this.continue();
                        }
                    } else {
                        Backbone.trigger(Teavents.SCAN_FINISHED);
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
            title = path.match(/\/([\w\-_\., ']*)\.epub$/);
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
            var reader, importBookWorker, sdCard;

            sdCard = navigator.getDeviceStorage("sdcard");

            reader = new FileReader();
            reader.onload = function (e) {
                importBookWorker = new Worker("importBook.js");
                importBookWorker.postMessage(e.target.result);
                importBookWorker.onmessage = function (event) {
                    Resizer.resize(event.data.cover, Math.round(window.screen.height / 4), function (thumbnail) {
                        if (thumbnail instanceof Blob) {
                            // create cover thumbnail
                            device.generateThumbnail(sdCard, thumbnail, event.data.authors[0].hashCode() + event.data.title.hashCode() + ".png", function (result) {
                                // thumbnail available
                                if (result) {
                                    event.data.cover = result;
                                }

                                // set metadata extracted from epub in the model
                                ebook.set(event.data);
                                ebook.save(null, {
                                    'success': callback,
                                    'error': callback
                                });
                            });
                        } else {
                            delete event.data.cover;
                            event.data.coverUrl = thumbnail;
                            ebook.set(event.data);
                            ebook.save(null, {
                                'success': callback,
                                'error': callback
                            });
                        }
                    });
                };
            };
            reader.readAsArrayBuffer(file);
        },

        generateThumbnail: function (storage, thumbnail, fileName, callback) {
            var deleteRequest, writeRequest, filePath;

            filePath = ".thumbnails/" + fileName;

            deleteRequest = storage.delete(filePath);
            deleteRequest.onsuccess = deleteRequest.onerror = function () {
                writeRequest = storage.addNamed(thumbnail, filePath);
                writeRequest.onsuccess = function () {
                    callback(this.result);
                };
                writeRequest.onerror = function () {
                    console.warn('File ' + filePath + " was not written", this.error);
                    callback(false);
                };
            };
        },

        readFile: function (fileName, callback) {
            var sdCard, request;
            sdCard = navigator.getDeviceStorage('sdcard');
            request = sdCard.get(fileName);

            request.onsuccess = function () {
                callback(this.result);
            };

            request.onerror = function () {
                console.warn('Unable to read the file', fileName, this.error);
                callback(false);
            };
        }
    };

    return device;
});