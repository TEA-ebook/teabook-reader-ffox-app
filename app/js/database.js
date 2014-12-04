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
            }
        ]
    };
});