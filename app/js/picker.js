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

function updateTitle(nbSelected) {
    "use strict";
    document.l10n.updateData({ number: nbSelected });
    document.l10n.localizeNode(document.querySelector('header'));
}

function selectFile(event) {
    "use strict"
    var el, input;
    el = event.target;

    if (el.tagName.toLowerCase() === 'input') {
        input = el;
    } else {
        while (el.tagName.toLowerCase() !== 'li') {
            el = el.parentNode;
        }
        input = el.querySelector("input");
    }

    input.checked = !input.checked;

    updateTitle(document.querySelectorAll(".picker-list-files input:checked").length);
}

function selectAll() {
    "use strict";
    var files, index = 0;
    files = document.querySelectorAll(".picker-list-files input");
    for (index; index < files.length; index += 1) {
        files[index].checked = true;
    }
    updateTitle(files.length);
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
        selectedFiles = document.querySelectorAll("input:checked");
        for (i = 0; i < selectedFiles.length; i += 1) {
            fileName = selectedFiles[i].getAttribute("id");
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
    var listFilesEl, fileEl, letterEl, filename, filePathParts, lastLetter = '';
    listFilesEl = document.querySelector(".picker-list-files");

    removeWaitingWheel();

    if (files && files.length > 0) {
        files = files.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase(), navigator.language);
        });
        files.forEach(function (file) {
            filePathParts = file.split('/');
            filename = filePathParts.pop();

            if (lastLetter !== filename.substring(0, 1).toUpperCase()) {
                lastLetter = filename.substring(0, 1).toUpperCase();
                letterEl = document.createElement("h2");
                letterEl.innerHTML = lastLetter;
                listFilesEl.appendChild(letterEl);
            }
            fileEl = document.createElement('li');
            fileEl.setAttribute("data-filename", file);
            fileEl.innerHTML = '<input type="checkbox" id="' + file + '" /><label for="' + file + '"></label><div class="file-title"><span class="picker-file-title">' + filename + '</span><span class="picker-file-path">' + filePathParts.join("/") + '</span></div>';
            listFilesEl.appendChild(fileEl);
        });

        document.querySelector(".picker-list-files").addEventListener("click", selectFile, true);
        document.querySelector(".picker-all").addEventListener("click", selectAll, false);
        document.querySelector("footer").addEventListener("click", sendFiles, false);
    } else {
        fileEl = document.createElement('li');
        fileEl.classList.add('empty');
        fileEl.innerHTML = '<span class="picker-file-title">' + window.document.l10n.getSync('noEpubOnPhone') + '</span><span class="picker-file-path">' + window.document.l10n.getSync('thatsSad') + '</span>';
        listFilesEl.appendChild(fileEl);
        document.querySelector("footer").classList.add("disabled");
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
        document.l10n.updateData({ number: 0 });
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