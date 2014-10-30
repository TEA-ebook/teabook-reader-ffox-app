/*global define: true, navigator: true, FileReader: true, window: true, key: true*/
define('view/ebook/index', ['backbone', 'helper/blobber', 'model/ebook-toc', 'view/ebook/toolbar', 'view/ebook/toc', 'template/ebook/index', 'spin'],
    function (Backbone, Blobber, EbookTocModel, ToolbarView, TocView, ebookTemplate, Spinner) {
        "use strict";

        var EbookView = Backbone.View.extend({

            className: "readium",

            events: {
                "click button.back": "backToBookshelf",
                "click button.bookshelf": "backToBookshelf",
                "click button.table-of-contents": "showToc",
                "click": "displayToolbar"
            },

            initialize: function () {
                this.listenTo(Backbone, 'visibility:visible', this.requestFullScreen);
                this.listenTo(Backbone, 'message', this.receiveMessage.bind(this));
                this.listenToOnce(Backbone, 'destroy', this.close.bind(this));

                this.toolbarView = new ToolbarView();

                this.render();
            },

            render: function () {
                // open ebook in fullscreen
                this.requestFullScreen();

                // render toolbar
                this.toolbarView.render();
                this.$el.html(this.toolbarView.el);

                // render sanboxed iframe
                this.$el.append(ebookTemplate(this.model.attributes));

                // spinning wheel : ebook is indeed long to load
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
                    } else if (typeof event.data === "object") {
                        if (event.data.type === "toc") {
                            this.generateToc(event.data.data);
                        }
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
                console.debug("ebook>index>getSandbox", this.sandbox);
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
                this.toolbarView.$el[0].classList.add("hidden");
                this.disableToolbarAutoHide();
            },

            displayToolbar: function () {
                if (this.toolbarView.$el[0].classList.contains("hidden")) {
                    this.toolbarView.$el[0].classList.remove("hidden");
                    this.toolbarTimer = window.setTimeout(this.hideToolbar.bind(this), 5000);
                } else {
                    this.hideToolbar();
                }
            },

            disableToolbarAutoHide: function () {
                if (this.toolbarTimer) {
                    window.clearTimeout(this.toolbarTimer);
                    this.toolbarTimer = null;
                }
            },

            generateToc: function (tocXml) {
                var toc = new EbookTocModel();
                toc.load(tocXml);

                this.tocView = new TocView({ model: toc, uri: this.model.get("name") });
                this.tocView.render();

                this.tocViewEl = this.$el.find(".ebook-toc");
                this.tocViewEl.html(this.tocView.el);
            },

            showToc: function (event) {
                event.stopImmediatePropagation();

                if (this.tocViewEl[0].classList.contains("hidden")) {
                    this.tocViewEl[0].classList.remove("hidden");
                    this.disableToolbarAutoHide();
                } else {
                    this.tocViewEl[0].classList.add("hidden");
                    this.hideToolbar();
                }
            },

            requestFullScreen: function () {
                Backbone.trigger("fullscreen:enter");
            },

            exitFullScreen: function () {
                Backbone.trigger("fullscreen:exit");
            },

            close: function () {
                this.stopListening(Backbone, "message");
                this.stopListening(Backbone, "visibility:visible");
                this.exitFullScreen();
                this.toolbarView.remove();
                if (this.tocView) {
                    this.tocView.remove();
                }
                this.remove();
            }
        });
        return EbookView;
    });