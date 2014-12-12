/*global define, navigator*/
define('helper/books-sort', function () {
    "use strict";

    return {
        authorAsc: function (bookA, bookB) {
            return bookA.get('authors')[0].localeCompare(bookB.get('authors')[0], navigator.language);
        },

        authorDesc: function (bookA, bookB) {
            return bookB.get('authors')[0].localeCompare(bookA.get('authors')[0], navigator.language);
        },

        lastRead: function (bookA, bookB) {
            return (bookA.get('read') > bookB.get('read')) ? -1 : 1;
        },

        lastAdded: function (bookA, bookB) {
            return (bookA.get('added') > bookB.get('added')) ? -1 : 1;
        },

        titleAsc: function (bookA, bookB) {
            return bookA.get('title').localeCompare(bookB.get('title'), navigator.language);
        },

        titleDesc: function (bookA, bookB) {
            return bookB.get('title').localeCompare(bookA.get('title'), navigator.language);
        }
    };
});