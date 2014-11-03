/*global define: true, navigator: true, FileReader: true, window: true, key: true*/
define('view/ebook/index',
    [   'backbone',
        'helper/blobber',
        'model/ebook-toc',
        'model/ebook-pagination',
        'view/ebook/toolbar',
        'view/ebook/toc',
        'view/ebook/options',
        'view/ebook/pagination',
        'template/ebook/index',
        'spin'],
    function (Backbone, Blobber, EbookTocModel, EbookPaginationModel, ToolbarView, TocView, OptionsView, PaginationView, template, Spinner) {
        "use strict";

        var EbookView = Backbone.View.extend({

            className: "readium",

            events: {
                "click button.back": "backToBookshelf",
                "click button.bookshelf": "backToBookshelf",
                "click button.table-of-contents": "showToc",
                "click button.options": "showOptions",
                "click .ebook-pagination-chapters": "showToc"
            },

            autoHideTime: 5000,

            initialize: function () {
                Backbone.on({
                    'visibility:visible': this.requestFullScreen,
                    'ebook:chapter': this.openChapter.bind(this),
                    'font-size:set': this.changeFontSize.bind(this),
                    'message': this.receiveMessage.bind(this),
                    'options:closed': this.hideUi.bind(this)
                });
                this.listenToOnce(Backbone, 'destroy', this.close.bind(this));

                this.paginationView = new PaginationView({ model: new EbookPaginationModel() });
                this.toolbarView = new ToolbarView();
                this.optionsView = new OptionsView();

                this.render();
            },

            render: function () {
                // open ebook in fullscreen
                this.requestFullScreen();

                // render toolbar
                this.toolbarView.render();
                this.$el.html(this.toolbarView.el);

                // render sanboxed iframe
                this.$el.append(template(this.model.attributes));

                // render options
                this.optionsView.render();
                this.$el.append(this.optionsView.el);

                // render pagination
                this.paginationView.render();
                this.$el.append(this.paginationView.el);
                this.paginationView.hide();

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

                return this;
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
                        this.toolbarView.hide();
                        this.optionsView.hide();
                        this.paginationView.hide();
                    } else if (event.data === "click" || event.data === "tap") {
                        if (this.toolbarView.toggle()) {
                            this.paginationView.show();
                            this.hideUiTempo();
                        } else {
                            this.paginationView.hide();
                            this.clearUiTempo();
                        }
                    } else if (typeof event.data === "object") {
                        this.handleReadiumEvent(event);
                    }
                } else {
                    console.warn("received empty message");
                }
            },

            handleReadiumEvent: function (event) {
                if (event.data.type === "toc") {
                    this.generateToc(event.data.data);
                } else if (event.data.type === "readium") {
                    var readiumEvent = event.data.event;
                    if (readiumEvent.type === "PaginationChanged") {
                        this.stopSpin();
                    } else if (readiumEvent.type === "ContentDocumentLoadStart") {
                        this.spin();
                    } else if (readiumEvent.type === "ContentDocumentLoaded") {
                        this.stopSpin();
                    }
                }
            },

            openChapter: function (chapter) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage({
                        action: "chapter",
                        content: chapter
                    }, "*");
                    this.hideToc();
                }
            },

            changeFontSize: function (fontSize) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage({
                        action: "font-size",
                        content: fontSize
                    }, "*");
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

            generateToc: function (tocXml) {
                var toc = new EbookTocModel();
                toc.load(tocXml);

                this.tocView = new TocView({ model: toc, uri: this.model.get("name") });
                this.tocView.render();

                this.$el.append(this.tocView.el);
            },

            showToc: function (event) {
                event.stopImmediatePropagation();
                this.clearUiTempo();

                if (this.tocView.toggle()) {
                    this.toolbarView.show();
                    this.optionsView.hide();
                    this.paginationView.hide();
                } else {
                    this.hideToc();
                }
            },

            hideToc: function () {
                this.tocView.hide();
                this.toolbarView.hide();
            },

            showOptions: function (event) {
                event.stopImmediatePropagation();
                this.clearUiTempo();

                if (this.optionsView.toggle()) {
                    this.toolbarView.show();
                    this.paginationView.show();
                    this.tocView.hide();
                }
            },

            hideUi: function () {
                this.toolbarView.hide();
                this.optionsView.hide();
                this.tocView.hide();
                this.paginationView.hide();
            },

            hideUiTempo: function () {
                this.uiTempo = setTimeout(this.hideUi.bind(this), this.autoHideTime);
            },

            clearUiTempo: function () {
                if (this.uiTempo) {
                    window.clearTimeout(this.uiTempo);
                    this.uiTempo = null;
                }
            },

            requestFullScreen: function () {
                Backbone.trigger("fullscreen:enter");
            },

            exitFullScreen: function () {
                Backbone.trigger("fullscreen:exit");
            },

            close: function () {
                Backbone.off("message");
                Backbone.off("visibility:visible");

                this.exitFullScreen();

                this.toolbarView.remove();
                this.paginationView.close();
                if (this.tocView) {
                    this.tocView.remove();
                }
                this.remove();
            }
        });
        return EbookView;
    });