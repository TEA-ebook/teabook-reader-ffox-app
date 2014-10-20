$(document).ready(function () {
    var blobber = new Blobber();

    var transferFile = function (filePath, fileType, dest) {
        blobber.buffery(filePath, function (_buffer) {
            var objData = {
                action: "transfer",
                type: fileType,
                content: _buffer
            };
            dest.postMessage(objData, "*");
        });
    };

    var sendMessage = function (message, dest) {
        dest.postMessage({
            action: "message",
            content: message
        }, "*");
    };

    var receiveMessage = function (event) {
        var sandbox = $('#sandbox')[0].contentWindow;

        if (event.data === "sendResources") {
            transferFile("vendor/requirejs/require.js", "text/javascript", sandbox);
            transferFile("lib/Readium.embedded.js", "text/javascript", sandbox);
        }

        else if (event.data === "sendEpub") {
            var sdcard = navigator.getDeviceStorage('sdcard');

            var filePath = "/sdcard/books/9782501075558.epub";
            //var filePath = "9782501075558.epub";
            var request = sdcard.get(filePath);

            request.onsuccess = function () {
                var reader = new FileReader();
                reader.onload = function(e) {
                    sandbox.postMessage({
                        action: "epub",
                        type: "application/epub+zip",
                        content: e.target.result
                    }, "*");
                };
                reader.readAsArrayBuffer(this.result);
            };

            request.onerror = function() {
                console.error(this.error);
            };
        }

        else if (event.data === "readyToRead") {
            setInterval(function() {
                sendMessage("nextPage", sandbox);
            }, 10000);
        }
    };
    window.addEventListener("message", receiveMessage, false);
});