/*global define: true, navigator: true, FileReader: true, window: true, key: true*/
define('view/ebook', ['backbone', 'helper/blobber', 'template/ebook', 'spin'],
    function (Backbone, Blobber, ebookTemplate, Spinner) {
        "use strict";

        var EbookView = Backbone.View.extend({

            className: "readium",

            events: {
                "click": "displayToolbar",
                "click button.back": "backToBookshelf"
            },

            initialize: function () {
                this.listenTo(Backbone, 'visibility:visible', this.requestFullScreen);
                this.listenTo(Backbone, 'message', this.receiveMessage.bind(this));
                this.listenTo(Backbone, 'destroy', this.close.bind(this));
                this.render();
            },

            render: function () {
                // open ebook in fullscreen
                this.requestFullScreen();

                this.$el.html(ebookTemplate(this.model.attributes));

                // spinning wheel : ebook load is long
                this.spinner = new Spinner({
                    hwaccel: true,
                    lines: 12,
                    length: 0,
                    radius: 29,
                    trail: 40,
                    width: 12
                });
                this.spin();
            },

            backToBookshelf: function () {
                this.close();
                Backbone.history.navigate('/', true);
            },

            receiveMessage: function (event) {
                if (event && event.data) {
                    if (event.data === "sendResources") {
                        this.transferFile("js/readium.js", "text/javascript", this.getSandbox());
                    } else if (event.data === "sendEpub") {
                        this.sendEpub();
                    } else if (event.data === "readyToRead") {
                        this.hideToolbar();
                    } else if (event.data === "PaginationChanged") {
                        this.stopSpin();
                    } else if (event.data === "ContentDocumentLoadStart") {
                        this.spin();
                    } else if (event.data === "ContentDocumentLoaded") {
                        this.stopSpin();
                    } else if (event.data === "click" || event.data === "tap") {
                        this.displayToolbar();
                    }
                } else {
                  console.warn("received empty message");
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

                // read epub from storage
                request.onsuccess = function () {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        // pass epub data to readium sandboxed iframe
                        sandbox.postMessage({
                            action: "epub",
                            type: "application/epub+zip",
                            content: e.target.result
                        }, "*");
                    };
                    reader.readAsArrayBuffer(this.result);
                };

                // need to better handle that
                request.onerror = function () {
                    console.error(this.error);
                };
            },

            transferFile: function (filePath, fileType, dest) {
                // transfer resource to iframe
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

            hideToolbar: function () {
                this.$el.find(".ebook-toolbar").addClass("hidden");
            },

            displayToolbar: function () {
                this.$el.find(".ebook-toolbar").removeClass("hidden");
                setTimeout(this.hideToolbar.bind(this), 4000);
            },

            requestFullScreen: function () {
                Backbone.trigger("fullscreen:enter");
            },

            exitFullScreen: function () {
                Backbone.trigger("fullscreen:exit");
            },

            close: function () {
                this.stopListening(Backbone);
                this.exitFullScreen();
                this.remove();
            }
        });
        return EbookView;
    });