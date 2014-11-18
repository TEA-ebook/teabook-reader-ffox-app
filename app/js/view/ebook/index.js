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
        'template/waiting',
        'spin'],
    function (Backbone, Blobber, EbookTocModel, EbookPaginationModel, ToolbarView, TocView, OptionsView, PaginationView, template, waitingTemplate, Spinner) {
        "use strict";

        var EbookView = Backbone.View.extend({

            className: "readium",

            events: {
                "click button.back": "backToBookshelf",
                "click button.bookshelf": "backToBookshelf",
                "click button.table-of-contents": "showToc",
                "click button.options": "showOptions"
            },

            autoHideTime: 5000,

            initialize: function () {
                Backbone.on(Teavents.MESSAGE, this.handleIframeMessage.bind(this));
                Backbone.on(Teavents.VISIBILITY_VISIBLE, this.requestFullScreen);
                Backbone.on(Teavents.OPTIONS_CLOSED, this.hideUi.bind(this));

                Backbone.on(Teavents.WORKING, this.isWorking.bind(this));
                Backbone.on(Teavents.NOT_WORKING, this.notWorking.bind(this));

                Backbone.on(Teavents.Actions.OPEN_CHAPTER, this.openChapter.bind(this));
                Backbone.on(Teavents.Actions.OPEN_PAGE, this.openPage.bind(this));
                Backbone.on(Teavents.Actions.SET_FONT_SIZE, this.changeFontSize.bind(this));
                Backbone.on(Teavents.Actions.SET_THEME, this.changeTheme.bind(this));

                this.listenToOnce(Backbone, 'destroy', this.close.bind(this));

                this.paginationView = new PaginationView({ model: new EbookPaginationModel() });
                this.toolbarView = new ToolbarView();
                this.optionsView = new OptionsView();

                this.waitingEl = waitingTemplate();

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

            handleIframeMessage: function (event) {
                if (event) {
                    if (event.type === Teavents.SEND_RESOURCES) {
                        this.transferFile("js/readium.js", "text/javascript", this.getSandbox());
                    } else if (event.type === Teavents.EPUB_SEND) {
                        this.sendEpub();
                    } else if (event.type === Teavents.READY_TO_READ) {
                        this.toolbarView.hide();
                        this.optionsView.hide();
                        this.paginationView.hide();
                    } else if (event.type === "toc") {
                        this.generateToc(event.data);
                    } else if (event.type === "title") {
                        this.setEbookTitle(event.data);
                    } else if (/^Readium:/.test(event.type)) {
                        this.handleReadiumEvent(event);
                    }
                } else {
                    console.warn("received empty message");
                }
            },

            handleReadiumEvent: function (event) {
                var readiumEvent = event.type.match(/^Readium:(\w*)/)[1];
                if (readiumEvent === Teavents.Readium.PAGINATION_CHANGED) {
                    this.stopSpin();
                    this.notWorking();
                } else if (readiumEvent === Teavents.Readium.CONTENT_LOAD_START) {
                    this.spin();
                } else if (readiumEvent === Teavents.Readium.CONTENT_LOADED) {
                    this.stopSpin();
                } else if (readiumEvent === Teavents.Readium.SETTINGS_APPLIED) {
                    this.notWorking();
                } else if (readiumEvent === Teavents.Readium.GESTURE_TAP) {
                    if (this.toolbarView.toggle()) {
                        this.paginationView.show();
                        this.hideUiTempo();
                    } else {
                        this.paginationView.hide();
                        this.clearUiTempo();
                    }
                } else if (readiumEvent === Teavents.Readium.GESTURE_PINCH) {
                    this.isWorking();
                }
            },

            openChapter: function (chapter) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage({
                        action: Teavents.Actions.OPEN_CHAPTER,
                        content: chapter
                    }, "*");
                    this.hideToc();
                }
            },

            openPage: function (percentage) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage({
                        action: Teavents.Actions.OPEN_PAGE,
                        content: percentage
                    }, "*");
                    this.hideToc();
                }
            },

            changeFontSize: function (fontSize) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage({
                        action: Teavents.Actions.SET_FONT_SIZE,
                        content: fontSize
                    }, "*");
                }
            },

            changeTheme: function (theme) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage({
                        action: Teavents.Actions.SET_THEME,
                        content: theme
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
                        action: Teavents.Actions.OPEN_EPUB,
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

                this.paginationView.setToc(toc);

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

            isWorking: function () {
                this.$el.append(this.waitingEl);
            },

            notWorking: function () {
                this.$el.find(".waiting").remove();
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
                this.optionsView.close();
                this.remove();
            }
        });
        return EbookView;
    });