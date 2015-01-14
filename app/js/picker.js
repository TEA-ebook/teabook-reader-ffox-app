/*global window, navigator, FileReader, document*/
/*jslint regexp: true, stupid: true*/

var activityRequest, excludedFilesList = [];

/**
 * List all .epub files in the SD card
 *
 * @param directory
 * @param callback
 * @param errorCb
 */
function listDir(callback, errorCb) {
    "use strict";

    var sdCard, cursor, files = [];

    if (navigator.getDeviceStorage) {
        sdCard = navigator.getDeviceStorage('sdcard');
        cursor = sdCard.enumerate();

        cursor.onsuccess = function () {
            if (!this.done) {
                var file = this.result;
                if (file && !/\.Trashes/i.test(file.name)
                        && /.*\/[^\.][\w\-_\., ']*\.epub$/i.test(file.name)
                        && !excludedFilesList.includes(file.name)) {
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
                console.warn("No epub file found", this.error);
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

/**
 * Update file piicker title with l20n
 *
 * @param nbSelected
 */
function updateTitle(nbSelected) {
    "use strict";
    document.l10n.updateData({ number: nbSelected });
    document.l10n.localizeNode(document.querySelector('header'));

    if (nbSelected > 0) {
        document.querySelector("footer").classList.remove("disabled");
    } else {
        document.querySelector("footer").classList.add("disabled");
    }
}

/**
 * Mark file as checked and update file picker title
 *
 * @param event
 */
function selectFile(event) {
    "use strict";
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

/**
 * Mark all files as checked and update title
 */
function selectAll() {
    "use strict";
    var files, index = 0;
    files = document.querySelectorAll(".picker-list-files input");
    for (index; index < files.length; index += 1) {
        files[index].checked = true;
    }
    updateTitle(files.length);
}

/**
 * Send files to the activity caller
 *
 * @param event
 */
function sendFiles(event) {
    "use strict";

    if (!event.target.classList.contains("disabled")) {
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
}

/**
 *
 */
function removeWaitingWheel() {
    "use strict";
    document.querySelector(".waiting").remove();
}

/**
 * Display file in the picker
 *
 * @param files
 */
function displayFiles(files) {
    "use strict";

    var listFilesEl = document.querySelector(".picker-list-files"),
        fileEl,
        letterEl,
        lastLetter = '';

    removeWaitingWheel();

    // files were found on the phone
    if (files && files.length > 0) {
        // exploding file path in 4 parts
        files = files.map(function (file) {
            var parts = file.split('/'), name;
            name = parts.pop();
            return {
                fullPath: file,
                path: parts.join('/'),
                name: name,
                letter: name.substring(0, 1).toUpperCase()
            };
        });

        // alphabetical sorting (without case and accent)
        files = files.sort(function (a, b) {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), navigator.language);
        });

        // display files in DOM
        files.forEach(function (file) {
            // alaphabet letter subtitle
            if (lastLetter !== file.letter) {
                lastLetter = file.letter;
                letterEl = document.createElement("h2");
                letterEl.innerHTML = lastLetter;
                listFilesEl.appendChild(letterEl);
            }

            // filename and path
            fileEl = document.createElement('li');
            fileEl.setAttribute("data-filename", file.fullPath);
            fileEl.innerHTML = '<input type="checkbox" id="' + file.fullPath + '" /><label for="' + file.fullPath + '"></label><div class="file-title"><span class="picker-file-title">' + file.name + '</span><span class="picker-file-path">' + file.path + '</span></div>';
            listFilesEl.appendChild(fileEl);
        });

        // add event listeners
        document.querySelector(".picker-list-files").addEventListener("click", selectFile, true);
        document.querySelector(".picker-all").addEventListener("click", selectAll, false);
        document.querySelector("footer").addEventListener("click", sendFiles, false);
    } else {
        // no epup file on the phone
        fileEl = document.createElement('li');
        fileEl.classList.add('empty');
        fileEl.innerHTML = '<div class="file-title"><span class="picker-file-title">' + window.document.l10n.getSync('noEpubOnPhone') + '</span><span class="picker-file-path">' + window.document.l10n.getSync('thatsSad') + '</span></div>';
        listFilesEl.appendChild(fileEl);
        document.querySelector(".picker-all").remove();
    }
}

/**
 * Display the error in the picker (ie: permission refused)
 *
 * @param error
 */
function displayError(error) {
    "use strict";
    var listFilesEl, errorEl, message;
    listFilesEl = document.querySelector(".picker-list-files");

    removeWaitingWheel();

    errorEl = document.createElement('li');
    errorEl.classList.add('error');
    message = '<div class="file-title"><span class="picker-file-title">';
    if (error && error.name === "SecurityError") {
        message += window.document.l10n.getSync('permissionRefusedToSdCard');
    } else {
        message += window.document.l10n.getSync('unknownError');
    }
    errorEl.innerHTML = message + '</span></div>';
    listFilesEl.appendChild(errorEl);

    document.querySelector(".picker-all").remove();
}

/**
 * User clicked on the close button : back to the caller
 */
function cancelActivity() {
    "use strict";
    if (activityRequest) {
        activityRequest.postError("cancel");
    } else {
        console.warn("you are not in a Firefox OS phone or simulator");
    }
}

/**
 * Start activity:
 *  - init l20n
 *  - list files
 *  - display files
 */
(function () {
    "use strict";

    window.document.l10n.ready(function () {
        listDir(displayFiles, displayError);

        document.l10n.updateData({ number: 0 });
        document.l10n.localizeNode(document.querySelector('body'));

        if (navigator.mozSetMessageHandler) {
            navigator.mozSetMessageHandler('activity', function (activityReq) {
                activityRequest = activityReq;
                excludedFilesList = activityReq.source.data.exclude;
            });
        } else {
            console.warn("you are not in a Firefox OS phone or simulator");
        }

        document.querySelector("button.back").addEventListener("click", cancelActivity);
    });
}());