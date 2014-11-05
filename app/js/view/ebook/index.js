/*global define: true, navigator: true, FileReader: true, window: true, Teavents: true*/
define('view/ebook/index',
    ['backbone',
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
                Backbone.on(Teavents.MESSAGE, this.handleBackboneEvent.bind(this));
                Backbone.on(Teavents.VISIBILITY_VISIBLE, this.requestFullScreen);
                Backbone.on(Teavents.EBOOK_CHAPTER, this.openChapter.bind(this));
                Backbone.on(Teavents.FONTSIZE_SET, this.changeFontSize.bind(this));
                Backbone.on(Teavents.OPTIONS_CLOSED, this.hideUi.bind(this));

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

            handleBackboneEvent: function (event) {
                if (event && event.data) {
                    if (event.data === Teavents.SEND_RESOURCES) {
                        this.transferFile("js/readium.js", "text/javascript", this.getSandbox());
                    } else if (event.data === Teavents.EPUB_SEND) {
                        this.sendEpub();
                    } else if (event.data === Teavents.READY_TO_READ) {
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
                } else if (event.data.type === "title") {
                    this.setEbookTitle(event.data.data);
                } else if (event.data.type === "readium") {
                    var readiumEvent = event.data.event;
                    if (readiumEvent.type === Teavents.Readium.PAGINATION_CHANGED) {
                        this.stopSpin();
                    } else if (readiumEvent.type === Teavents.Readium.CONTENT_LOAD_START) {
                        this.spin();
                    } else if (readiumEvent.type === Teavents.Readium.CONTENT_LOADED) {
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
                    chapter = this.model.get("chapter"),
                    sandbox = this.getSandbox(),
                    epubData = {
                        action: "epub",
                        type: "application/epub+zip"
                    };

                // read epub from storage
                request.onsuccess = function () {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        // pass epub data to readium sandboxed iframe
                        epubData.content = e.target.result;

                        if (chapter) {
                            epubData.chapter = chapter;
                        }

                        sandbox.postMessage(epubData, "*");
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

            generateToc: function (tocXml) {
                var toc = new EbookTocModel();
                toc.load(tocXml);

                this.tocView = new TocView({ model: toc, uri: this.model.get("name") });
                this.tocView.render();

                this.paginationView.model.set("fixedChapterTotal", toc.get("items").length);

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

            setEbookTitle: function (title) {
                this.paginationView.model.set('title', title);
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
                Backbone.trigger(Teavents.FULLSCREEN_ENTER);
            },

            exitFullScreen: function () {
                Backbone.trigger(Teavents.FULLSCREEN_EXIT);
            },

            close: function () {
                Backbone.off(Teavents.MESSAGE);
                Backbone.off(Teavents.VISIBILITY_VISIBLE);

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