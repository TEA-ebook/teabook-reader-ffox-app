/*global navigator, File, XMLHttpRequest*/

// DeviceStorage polyfill

if (!navigator.getDeviceStorage) {

    var storageTypes = ["sdcard", "pictures", "videos", "music"];

    var DeviceStorage = function (storageName) {
        "use strict";
        this.storageName = storageName;
    };

    DeviceStorage.prototype.enumerate = function (path) {
        "use strict";
        var request, xhr, self;

        self = this;

        path = path || "books";

        request = {
            onsuccess: false,
            onerror: function (err) {
                console.error(err);
            }
        };

        xhr = new XMLHttpRequest();
        xhr.open('GET', path + "/list", true);

        xhr.onload = function () {
            var fileNames = xhr.responseText.split("\n").filter(function (item) {
                return item.length > 0;
            });

            request.continue = function () {
                request.done = (fileNames.length === 0);
                if (!request.done) {
                    var fileReq = self.get(path + "/" + fileNames.pop());
                    fileReq.onsuccess = function () {
                        request.result = this.result;
                        if (request.onsuccess) {
                            request.onsuccess();
                        }
                    };
                } else if (request.onsuccess) {
                    request.onsuccess();
                }
            };

            request.continue();
        };

        xhr.onerror = function (e) {
            request.onerror(e);
        };

        xhr.send();

        return request;
    };

    DeviceStorage.prototype.get = function (fileName) {
        "use strict";
        var request = {
            onsuccess: false,
            onerror: function (err) {
                console.error(err);
            }
        };

        var xhr = new XMLHttpRequest();
        xhr.open('GET', fileName, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function () {
            request.result = new File([xhr.response], fileName);
            if (request.onsuccess) {
                request.onsuccess();
            }
        };

        xhr.onerror = function (e) {
            request.onerror(e);
        };

        xhr.send();

        return request;
    };

    var getDeviceStorage = function (storageName) {
        "use strict";

        var storageInstance = null;

        if (storageName && (storageTypes.indexOf(storageName) !== -1)) {
            storageInstance = new DeviceStorage(storageName);
        }

        return storageInstance;
    };

    navigator.getDeviceStorage = getDeviceStorage;
}