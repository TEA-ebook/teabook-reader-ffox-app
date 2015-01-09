/*global window, navigator, FileReader, document*/
/*jslint regexp: true, stupid: true*/

var currentDirectory = ".", activityRequest;

function listDir(directory, callback, errorCb) {
    "use strict";

    var sdCard, cursor, files = [];

    directory = directory || ".";

    if (navigator.getDeviceStorage) {
        sdCard = navigator.getDeviceStorage('sdcard');
        cursor = sdCard.enumerate();

        cursor.onsuccess = function () {
            if (!this.done) {
                var file = this.result;
                if (file && !/\.Trashes/.test(file.name) && /.*\/[^\.][\w\-_\., ']*\.epub$/.test(file.name)) {
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
            if (this.error && this.error.name) {
                if (errorCb) {
                    errorCb(this.error);
                    return;
                }
                console.warn(this.error);
            } else {
                console.warn("No epub file found in " + directory, this.error);
            }

            if (callback) {
                callback();
            }
        };
    } else {
        console.error("no device storage");
        if (callback) {
            callback();
        }
    }
}

function selectFile(event) {
    "use strict";
    var fileEl = event.target.hasAttribute("data-filename") ? event.target : event.target.parentNode;
    if (fileEl.classList.contains("selected")) {
        fileEl.classList.remove("selected");
    } else {
        fileEl.classList.add("selected");
    }
}

function sendFiles() {
    "use strict";
    var sdCard, request, fileName, i, selectedFiles, onReadSuccess, onError, errors = [], files = [];

    onReadSuccess = function () {
        files.push(this.result);

        if (selectedFiles.length === files.length) {
            if (errors.length > 0) {
                activityRequest.postError(errors.join(", "));
            }

            activityRequest.postResult({
                files: files
            });
        }
    };

    onError = function () {
        errors.push("can't pick the epub " + fileName);
    };

    if (activityRequest && navigator.getDeviceStorage) {
        sdCard = navigator.getDeviceStorage('sdcard');
        selectedFiles = document.querySelectorAll("li.selected");
        for (i = 0; i < selectedFiles.length; i += 1) {
            fileName = selectedFiles[i].getAttribute("data-filename");
            if (activityRequest && navigator.getDeviceStorage) {
                request = sdCard.get(fileName);
                request.onsuccess = onReadSuccess;
                request.onerror = onError;
            }
        }
    } else {
        console.warn("you're not in a Firefox OS phone or simulator");
    }
}

function removeWaitingWheel() {
    "use strict";
    document.querySelector(".waiting").remove();
}

function displayFiles(files) {
    "use strict";
    var listFilesEl, fileEl, filename;
    listFilesEl = document.querySelector(".picker-list-files");

    removeWaitingWheel();

    if (files && files.length > 0) {
        files = files.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase(), navigator.language);
        });
        files.forEach(function (file) {
            filename = file.split('/');
            fileEl = document.createElement('li');
            fileEl.setAttribute("data-filename", file);
            fileEl.innerHTML = '<span class="picker-file-title">' + filename.pop() + '</span><span class="picker-file-path">' + filename.join("/") + '</span><hr>';
            listFilesEl.appendChild(fileEl);
        });

        document.querySelector(".picker-list-files").addEventListener("click", selectFile);
        document.querySelector(".picker-ok").addEventListener("click", sendFiles);
    } else {
        fileEl = document.createElement('li');
        fileEl.classList.add('empty');
        fileEl.innerHTML = '<span class="picker-file-title">' + window.document.l10n.getSync('noEpubOnPhone') + '</span><span class="picker-file-path">' + window.document.l10n.getSync('thatsSad') + '</span>';
        listFilesEl.appendChild(fileEl);
        document.querySelector(".picker-ok").remove();
    }
}

function displayError(error) {
    "use strict";
    var listFilesEl, errorEl, message;
    listFilesEl = document.querySelector(".picker-list-files");

    removeWaitingWheel();

    errorEl = document.createElement('li');
    errorEl.classList.add('error');
    message = '<span class="picker-file-title">';
    if (error && error.name === "SecurityError") {
        message += window.document.l10n.getSync('permissionRefusedToSdCard');
    } else {
        message += window.document.l10n.getSync('unknownError');
    }
    errorEl.innerHTML = message + '</span>';
    listFilesEl.appendChild(errorEl);

    document.querySelector(".picker-ok").remove();
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

    listDir(currentDirectory, displayFiles, displayError);

    window.document.l10n.ready(function () {
        document.l10n.localizeNode(document.querySelector('body'));

        if (navigator.mozSetMessageHandler) {
            navigator.mozSetMessageHandler('activity', function (activityReq) {
                activityRequest = activityReq;
            });
        } else {
            console.warn("you are not in a Firefox OS phone or simulator");
        }

        document.querySelector("button.back").addEventListener("click", cancelActivity);
    });
}());