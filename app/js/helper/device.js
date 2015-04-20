/*global define, Blob, FileReader, File, Worker, window, navigator, Uint8Array, Teavents, Conf, XMLHttpRequest*/
/*jslint regexp: true, unparam: true*/
define('helper/device', ['jquery', 'backbone', 'model/book', 'helper/resizer', 'helper/logger'], function ($, Backbone, BookModel, Resizer, Logger) {
    "use strict";

    var device = {
        scanSdCard: function (collection) {
            var cursor, sdcard;

            if (navigator && navigator.getDeviceStorage) {
                sdcard = navigator.getDeviceStorage('sdcard');

                // Let's browse all the books available
                cursor = sdcard.enumerate();
                cursor.onsuccess = function () {
                    if (!this.done) {
                        var file = this.result;
                        if (file && !/\.Trashes/.test(file.name) && /.*\/[\w\-_\., ']*\.epub$/.test(file.name)) {
                            device.addBookToBookcase(file, collection, this.continue.bind(this));
                        } else {
                            this.continue();
                        }
                    } else {
                        Backbone.trigger(Teavents.SCAN_FINISHED);
                    }
                };

                cursor.onerror = function () {
                    console.warn("No book file found: " + this.error);
                };
            } else {
                console.warn("You have no SD card access");
            }
        },

        addBook: function (file, callback) {
            device.addBookToBookcase(file, null, callback);
        },

        addBookToBookcase: function (file, collection, callback, errorCb) {
            var book = new BookModel(), path, title;

            path = window.decodeURIComponent(file.name);
            if (!navigator.mozSetMessageHandler && !/^books\//.test(path)) {
                path = "books/" + path;
            }

            // try to extract title from file path
            title = path.match(/\/([\w\-_\., ']*)\.epub$/);
            title = title ? title[1] : path;

            // save it in indexedDB
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

                    // scan epub for metadata and cover image
                    device.scanFile(file, book, function () {
                        callback(book);
                    }.bind(this), function (error) {
                        book.destroy({ silent: true });
                        errorCb(error);
                    });
                }.bind(this),
                'error': function (model, error) {
                    console.warn("Can't import " + model.get('path') + " :", error.target.error.message);
                    callback(book);
                }.bind(this)
            });
        },

        scanFile: function (file, book, callback, error) {
            var reader, importBookWorker, sdCard;

            sdCard = navigator.getDeviceStorage("sdcard");

            reader = new FileReader();
            reader.onload = function (e) {
                importBookWorker = new Worker("importBook.js");
                importBookWorker.postMessage(e.target.result);
                importBookWorker.onmessage = function (event) {
                    if (!event.data.error) {
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
                    } else { // import worker failed
                        if (error) {
                            error(event.data.message);
                        } else {
                            console.warn("Can't scan the file " + file.name, event.data.error.message);
                            callback(false);
                        }
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
        },

        /**
         *
         */
        checkSdCardAvailability: function (cb, errorCb) {
            if (navigator.getDeviceStorage) {
                var sdcard = navigator.getDeviceStorage("sdcard"),
                    availableRequest = sdcard.available();

                availableRequest.onsuccess = function () {
                    if (this.result === "available") {
                        if (cb) {
                            cb();
                        }
                    } else {
                        if (errorCb) {
                            errorCb();
                        }
                    }
                };

                availableRequest.onerror = errorCb;
            } else {
                console.warn("You are not on a FirefoxOS phone or in a Firefox OS simulator.");
                if (cb) {
                    cb();
                }
            }
        },

        getOfferedBookList: function (lang, callback) {
            Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.DOWNLOAD_BOOKS, { language: navigator.language });

            lang = lang.substring(0, 2);

            if (lang !== 'fr' && lang !== 'en') {
                lang = 'en';
            }

            $.ajax({
                url: Conf.host + "/books/" + lang + "/list.json",
                method: "GET",
                dataType: "json"
            }).done(function (list) {
                callback(list);
            }).fail(function (error) {
                console.warn("Can't download book list for lang " + lang, error);
                callback([]);
            });
        },

        downloadBook: function (url, callback, errorCb) {
            var fileName = url.substring(url.lastIndexOf("/") + 1),
                xhr = new XMLHttpRequest();

            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function () {
                if (xhr.status === 200 || xhr.status === 0) { // status 0 is a bug in the implementation of XHR in PhantomJS
                    var file = new File([xhr.response], fileName);
                    device.writeFile(file, fileName, callback, errorCb);
                }
            };

            xhr.onerror = function (error) {
                if (errorCb) {
                    errorCb(error);
                } else {
                    console.error("Can't download book at " + url, error);
                }
            };

            xhr.send();
        },

        writeFile: function (file, name, callback, errorCb) {
            name = "books/" + name;

            var sdcard = navigator.getDeviceStorage("sdcard"),
                request = sdcard.addNamed(file, name);

            request.onsuccess = function () {
                console.info('File "' + this.result + '" successfully written on the sdcard');
                device.readFile(this.result, callback);
            };

            request.onerror = function () {
                // file already exists
                if (this.error.name === "NoModificationAllowedError") {
                    device.readFile(name, callback);
                } else {
                    console.warn('Unable to write the file: ' + this.error);
                    errorCb(this.error);
                }
            };
        }
    };

    return device;
});