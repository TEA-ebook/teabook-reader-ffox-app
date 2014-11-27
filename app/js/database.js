/*global define*/
define('database', function () {
    "use strict";

    return {
        id: "teareader",
        migrations: [
            {
                version: 1,
                migrate: function (transaction, next) {
                    var ebooks = transaction.db.createObjectStore("ebooks", { keyPath: "path" });
                    ebooks.createIndex("title", "title");
                    ebooks.createIndex("path", "path", { unique: true });
                    next();
                }
            },
            {
                version: 2,
                migrate: function (transaction, next) {
                    var bookmarks = transaction.db.createObjectStore("bookmarks", { keyPath: 'id', autoIncrement: true });
                    bookmarks.createIndex("path", "path");
                    bookmarks.createIndex("path, cfi", ["path", "cfi"], { unique: true });
                    next();
                }
            }
        ]
    };
});