/*global define, Blob, FileReader, Worker, window, navigator, Uint8Array, Teavents*/
/*jslint regexp: true, unparam: true*/
define('helper/device', ['backbone', 'model/book', 'helper/resizer', 'helper/logger'], function (Backbone, BookModel, Resizer, Logger) {
    "use strict";

    var device = {
        addBook: function (file, callback) {
            device.addBookToBookcase(file, null, callback);
        },

        addBookToBookcase: function (file, collection, callback) {
            var book = new BookModel(), path, title;

            path = window.decodeURIComponent(file.name);
            if (!navigator.mozSetMessageHandler) {
                path = "books/" + path;
            }

            title = path.match(/\/([\w\-_\., ']*)\.epub$/);
            title = title ? title[1] : path;

            book.save({
                'title': title,
                'path': path,
                'size': file.size,
                'added': Date.now(),
                'read': Math.round(Date.now() / 10000)
            }, {
                'success': function () {
                    if (collection) {
                        collection.add(book);
                    }
                    device.scanFile(file, book, function () {
                        callback(book);
                    }.bind(this));
                }.bind(this),
                'error': function (model, error) {
                    console.warn("Can't import " + model.get('path') + " :", error.target.error.message);
                    callback(book);
                }.bind(this)
            });
        },

        scanFile: function (file, book, callback) {
            var reader, importBookWorker, sdCard;

            sdCard = navigator.getDeviceStorage("sdcard");

            reader = new FileReader();
            reader.onload = function (e) {
                importBookWorker = new Worker("importBook.js");
                importBookWorker.postMessage(e.target.result);
                importBookWorker.onmessage = function (event) {
                    // generate uuid
                    event.data.uuid = Logger.generateUUID();

                    // generate search string
                    event.data.search = device.generateSearchString(event.data);

                    // generate thumbnail
                    if (event.data.cover) {
                        Resizer.resize(event.data.cover, Math.round(window.screen.height / 2), function (thumbnail) {
                            if (thumbnail instanceof Blob) {
                                // create cover thumbnail
                                device.generateThumbnail(sdCard, thumbnail, event.data.authors[0].hashCode() + event.data.title.hashCode() + ".png", function (result) {
                                    // thumbnail available
                                    if (result) {
                                        event.data.cover = result;
                                    }

                                    // set metadata extracted from epub in the model
                                    device.saveBook(book, event.data, callback);
                                });
                            } else {
                                delete event.data.cover;
                                event.data.coverUrl = thumbnail;
                                device.saveBook(book, event.data, callback);
                            }
                        });
                    } else {
                        device.saveBook(book, event.data, callback);
                    }
                };
            };
            reader.readAsArrayBuffer(file);
        },

        saveBook: function (book, data, callback) {
            book.set(data);
            book.save(null, {
                'success': callback,
                'error': callback
            });
            Logger.addBook(data);
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
        },

        generateSearchString: function (metadata) {
            var keys = [];
            keys.push(metadata.title.removeDiacritics().toLowerCase().tokenize(2));
            keys.push(metadata.authors.join(" ").removeDiacritics().toLowerCase().tokenize(2));
            keys.push(metadata.publisher.removeDiacritics().toLowerCase().tokenize(2));
            return keys.join(",");
        }
    };

    return device;
});