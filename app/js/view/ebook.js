/*global define: true, navigator: true, FileReader: true, window: true*/
define('view/ebook', ['backbone', 'jquery', 'tools/blobber', 'template/ebook', 'spin', 'keymaster'],
    function (Backbone, $, Blobber, ebookTemplate, Spinner) {
        "use strict";

        var EbookView = Backbone.View.extend({

            className: "readium",

            events: {
                "click button.back": "backToBookshelf"
            },

            initialize: function () {
                this.render();
            },

            render: function () {
                this.$el.html(ebookTemplate(this.model.attributes));
                this.spinner = new Spinner({
                    hwaccel: true,
                    lines: 12,
                    length: 0,
                    radius: 29,
                    trail: 40,
                    width: 12
                });
                this.spin();

                this.$el.find(".ebook-toolbar").focus();

                $(window).on("message", this.receiveMessage.bind(this));
            },

            backToBookshelf: function () {
                this.close();
                Backbone.history.navigate('/', true);
            },

            receiveMessage: function (event) {
                if (event.originalEvent.data === "sendResources") {
                    this.transferFile("js/require.js", "text/javascript", this.getSandbox());
                    this.transferFile("js/Readium.embedded.js", "text/javascript", this.getSandbox());
                } else if (event.originalEvent.data === "sendEpub") {
                    this.sendEpub();
                } else if (event.originalEvent.data === "readyToRead") {
                    key('left', function() {
                        this.sendMessage("prevPage", this.getSandbox());
                    }.bind(this));
                    key('right', function() {
                        this.sendMessage("nextPage", this.getSandbox());
                    }.bind(this));
                } else if (event.originalEvent.data === "PaginationChanged") {
                    this.stopSpin();
                } else if (event.originalEvent.data === "ContentDocumentLoadStart") {
                    this.spin();
                } else if (event.originalEvent.data === "ContentDocumentLoaded") {
                    this.stopSpin();
                } else {
                    console.debug("Received message from Readium : " + event.originalEvent.data);
                }
            },

            spin: function () {
                this.spinner.spin(this.$el[0]);
            },

            stopSpin: function () {
                this.spinner.stop();
            },

            getSandbox: function () {
                if (!this.sandbox) {
                    this.sandbox = this.$el.find('iframe')[0].contentWindow;
                }
                return this.sandbox;
            },

            sendEpub: function () {
                var sdcard = navigator.getDeviceStorage('sdcard'),
                    request = sdcard.get(this.model.get('name')),
                    sandbox = this.getSandbox();

                request.onsuccess = function () {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        sandbox.postMessage({
                            action: "epub",
                            type: "application/epub+zip",
                            content: e.target.result
                        }, "*");
                    };
                    reader.readAsArrayBuffer(this.result);
                };

                request.onerror = function () {
                    console.error(this.error);
                };
            },

            transferFile: function (filePath, fileType, dest) {
                Blobber.buffery(filePath, function (buffer) {
                    var objData = {
                        action: "transfer",
                        type: fileType,
                        content: buffer
                    };
                    dest.postMessage(objData, "*");
                });
            },

            sendMessage: function (message, dest) {
                dest.postMessage({
                    action: "message",
                    content: message
                }, "*");
            },

            close: function () {
                $(window).off("message");
                this.remove();
            }
        });
        return EbookView;
    });