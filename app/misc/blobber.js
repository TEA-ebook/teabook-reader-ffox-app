var Blobber = (function () {
    'use strict'

    // private variables and functions

    // constructor
    var blobber = function () {
        //
    };

    // prototype
    blobber.prototype = {
        constructor: blobber,
        blobify: function (file, type, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function () {
                var blobbedFile = new Blob([xhr.response], { "type": type });
                callback(blobbedFile, window.URL.createObjectURL(blobbedFile));
            };

            xhr.send();
        },

        buffery: function(file, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', file, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function () {
                callback(xhr.response);
            };

            xhr.send();
        }
    };

    // return module
    return blobber;
})();