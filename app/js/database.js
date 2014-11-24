/*global define: true*/
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
            }
        ]
    };
});