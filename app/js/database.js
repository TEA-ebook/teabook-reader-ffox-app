/*global define*/
define('database', function () {
    "use strict";

    return {
        id: "teareader",
        migrations: [
            {
                version: 1,
                migrate: function (transaction, next) {
                    var books, bookmarks;

                    books = transaction.db.createObjectStore("books", { keyPath: 'hash' });
                    books.createIndex("title", "title");
                    books.createIndex("hash", "hash", { unique: true });

                    bookmarks = transaction.db.createObjectStore("bookmarks", { keyPath: 'id', autoIncrement: true });
                    bookmarks.createIndex("hash", "hash");
                    bookmarks.createIndex("hash, cfi", ["hash", "cfi"], { unique: true });

                    next();
                }
            },
            {
                version: 2,
                migrate: function (transaction, next) {
                    var settings;

                    settings = transaction.db.createObjectStore("settings", { keyPath: 'id', autoIncrement: true });
                    settings.createIndex("name", "name", { unique: true });

                    next();
                }
            },
            {
                version: 3,
                migrate: function (transaction, next) {
                    var events;

                    events = transaction.db.createObjectStore("events", { keyPath: 'id', autoIncrement: true });
                    events.createIndex("name", "name");
                    events.createIndex("timestamp", "timestamp");

                    next();
                }
            }
        ]
    };
});