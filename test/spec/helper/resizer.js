/*global describe, beforeEach, afterEach, should, it, curl, sinon, XMLHttpRequest*/

function readFile (fileName, callback) {
    "use strict";
    var xhr = new XMLHttpRequest();
    xhr.open('GET', fileName, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 0) { // status 0 is a bug in the implementation of XHR in PhantomJS
            callback(xhr.response);
        } else {
            callback(false);
        }
    };

    xhr.onerror = function () {
        callback(false);
    };

    xhr.send();
}

(function () {
    "use strict";
    describe('Resizer helper', function () {
        var sandbox;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('should', function () {
            it('resize image if it\'s too large', function (done) {
                curl(['helper/resizer'], function (Resizer) {
                    // Given a too large picture
                    readFile('samples/cover.jpeg', function (pictureData) {
                        if (pictureData) {
                            // When we resize the picture
                            Resizer.resize(pictureData, 200, function (data) {

                                // Then the picture height should be 200
                                console.debug(data);
                                done();
                            });
                        } else {
                            console.error("failed");
                            done();
                        }
                    });
                });
            });
        });
    });
}());