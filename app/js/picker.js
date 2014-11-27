/*global window, navigator, FileReader, document*/
/*jslint regexp: true*/

var currentDirectory = ".", activityRequest;

function listDir(directory, callback) {
    "use strict";

    var sdCard, cursor, files = [];

    directory = directory || ".";

    if (navigator.getDeviceStorage) {
        sdCard = navigator.getDeviceStorage('sdcard');
        cursor = sdCard.enumerate();

        cursor.onsuccess = function () {
            if (!this.done) {
                var file = this.result;
                if (file && !/\.Trashes/.test(file.name) && /.*\/[\w \-_]*\.epub$/.test(file.name)) {
                    files.push(file.name);
                }
                this.continue();
            } else {
                if (callback) {
                    callback(files);
                }
            }
        };

        cursor.onerror = function () {
            console.warn("No epub file found in " + directory, this.error);
        };
    } else {
        console.error("no device storage");
    }
}

function pickFile(event) {
    "use strict";
    var sdCard, request, fileName;

    fileName = event.target.textContent;
    if (activityRequest && navigator.getDeviceStorage) {
        sdCard = navigator.getDeviceStorage('sdcard');
        request = sdCard.get(fileName);
        request.onsuccess = function () {
            activityRequest.postResult({
                type: 'application/epub+zip',
                blob: this.result,
                name: window.encodeURIComponent(fileName)
            }, 'application/epub+zip');
        };
        request.onerror = function () {
            activityRequest.postError("can't pick the epub " + fileName);
        };
    } else {
        console.warn("you picked the file " + fileName + ", but you're not in a Firefox OS phone or simulator");
    }
}

function displayFiles(files) {
    "use strict";
    var listFilesEl, fileEl;
    listFilesEl = document.querySelector(".picker-list-files");
    if (files) {
        files.forEach(function (file) {
            console.debug("display file", file);
            fileEl = document.createElement('li');
            fileEl.textContent = file;
            listFilesEl.appendChild(fileEl);
        });

        document.querySelector(".picker-list-files").addEventListener("click", pickFile);
    }
}

function cancelActivity() {
    "use strict";
    if (activityRequest) {
        activityRequest.postError("cancel");
    } else {
        console.warn("you are not in a Firefox OS phone or simulator");
    }
}

(function () {
    "use strict";

    listDir(currentDirectory, displayFiles);

    window.document.l10n.ready(function () {
        document.l10n.localizeNode(document.querySelector('body'));

        if (navigator.mozSetMessageHandler) {
            navigator.mozSetMessageHandler('activity', function (activityReq) {
                activityRequest = activityReq;
            });
        }

        document.querySelector("button.back").addEventListener("click", cancelActivity);
    });
}());