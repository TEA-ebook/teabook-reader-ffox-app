/*global define, navigator, FileReader, window, Teavents*/
/*jslint stupid: true*/
define('view/book/index',
    ['backbone',
        'helper/blobber',
        'model/book-toc',
        'model/book-pagination',
        'view/book/bookmarks',
        'view/book/toolbar',
        'view/book/toc',
        'view/book/options',
        'view/book/pagination',
        'template/book/index',
        'template/waiting',
        'spin'],
    function (Backbone,
              Blobber,
              BookTocModel,
              BookPaginationModel,
              BookmarksView,
              ToolbarView,
              TocView,
              OptionsView,
              PaginationView,
              template,
              waitingTemplate,
              Spinner) {
        "use strict";

        var BookView = Backbone.View.extend({

            className: "readium",

            events: {
                "click button.back": "backToBookcase",
                "click button.bookcase": "backToBookcase",
                "click button.table-of-contents": "showToc",
                "click button.bookmark": "showBookmarks",
                "click button.options": "showOptions"
            },

            autoHideTime: 5000,

            initialize: function (options) {
                Backbone.on(Teavents.MESSAGE, this.handleIframeMessage.bind(this));
                Backbone.on(Teavents.VISIBILITY_VISIBLE, this.requestFullScreen);
                Backbone.on(Teavents.OPTIONS_CLOSED, this.hideUi.bind(this));

                Backbone.on(Teavents.WORKING, this.isWorking.bind(this));
                Backbone.on(Teavents.NOT_WORKING, this.notWorking.bind(this));

                Backbone.on(Teavents.Actions.OPEN_CHAPTER, this.openChapter.bind(this));
                Backbone.on(Teavents.Actions.OPEN_PAGE, this.openPage.bind(this));
                Backbone.on(Teavents.Actions.OPEN_POSITION, this.openPosition.bind(this));
                Backbone.on(Teavents.Actions.SET_FONT_SIZE, this.changeFontSize.bind(this));
                Backbone.on(Teavents.Actions.SET_THEME, this.changeTheme.bind(this));
                Backbone.on(Teavents.Actions.BOOKMARK_PAGE, this.bookmarkPage.bind(this));

                this.listenToOnce(Backbone, 'destroy', this.close.bind(this));

                this.paginationView = new PaginationView({ model: new BookPaginationModel() });
                this.toolbarView = new ToolbarView();
                this.optionsView = new OptionsView();
                this.bookmarksView = new BookmarksView({ hash: this.model.get('hash') });

                this.waitingEl = waitingTemplate();

                this.lastPinchAck = Date.now();

                this.pageRequest = options.pageRequest;

                this.model.fetch({
                    success: this.render.bind(this)
                });
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
                this.$el.append(this.paginationView.el);

                // render bookmarks
                this.$el.append(this.bookmarksView.el);

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

                // font sample
                this.fontSample = this.$el.find(".ebook-font-size-sample");

                return this;
            },

            backToBookcase: function () {
                // saving position
                this.getPosition(function (event) {
                    if (event.type === Teavents.CURRENT_POSITION) {
                        this.savePosition(event.data);
                        this.close();
                        Backbone.history.navigate('/', true);
                    }
                }.bind(this));
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
                    } else if (event.type === Teavents.TOC) {
                        this.generateToc(event.data);
                    } else if (event.type === Teavents.PAGE_BOOKMARKED) {
                        this.saveBookmark(event.data);
                    } else if (/^Readium:/.test(event.type)) {
                        this.handleReadiumEvent(event);
                    }
                } else {
                    console.warn("received empty message");
                }
            },

            handleReadiumEvent: function (event) {
                var readiumEvent, cssValues;

                readiumEvent = event.type.match(/^Readium:(\w*)/)[1];
                if (readiumEvent === Teavents.Readium.PAGINATION_CHANGED) {
                    this.stopSpin();
                    this.notWorking();
                } else if (readiumEvent === Teavents.Readium.CONTENT_LOAD_START) {
                    this.spin();
                } else if (readiumEvent === Teavents.Readium.CONTENT_LOADED) {
                    this.stopSpin();
                } else if (readiumEvent === Teavents.Readium.SETTINGS_APPLIED) {
                    this.lastPinchAck = Date.now();
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
                    this.lastPinchAck = Date.now();
                    this.fontSample.hide();
                    this.isWorking();
                } else if (readiumEvent === Teavents.Readium.GESTURE_PINCH_MOVE) {
                    if (Date.now() - this.lastPinchAck > 50) {
                        cssValues = {
                            "font-size": event.data.fontSize + "%"
                        };
                        if (this.fontSample.css("display") === "none") {
                            cssValues.top = (event.data.center.y - (this.fontSample.height() / 2)) + "px";
                            cssValues.left = (event.data.center.x - (this.fontSample.width() / 2)) + "px";
                            this.fontSample.show();
                        }
                        this.fontSample.css(cssValues);
                    }
                }
            },

            openChapter: function (chapter) {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.OPEN_CHAPTER,
                    content: chapter
                });
                this.hideToc();
            },

            openPage: function (percentage) {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.OPEN_PAGE,
                    content: percentage
                });
                this.hideToc();
            },

            openPosition: function (idref, cfi) {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.OPEN_POSITION,
                    content: {
                        'idref': idref,
                        'cfi': cfi
                    }
                });
                this.hideBookmarks();
            },

            getPosition: function (callback) {
                Backbone.on(Teavents.MESSAGE, callback);
                this.sendMessageToSandbox({
                    action: Teavents.Actions.GET_POSITION
                });
            },

            bookmarkPage: function () {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.BOOKMARK_PAGE
                });
            },

            changeFontSize: function (fontSize) {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.SET_FONT_SIZE,
                    content: fontSize
                });
            },

            changeTheme: function (theme) {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.SET_THEME,
                    content: theme
                });
            },

            sendMessageToSandbox: function (message) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage(message, "*");
                }
            },

            saveBookmark: function (bookmarkInfo) {
                var paginationInfo = this.paginationView.model.attributes,
                    tocItem = this.tocView.model.getCurrentItem().attributes;
                window.document.l10n.updateData({
                    "pageCurrent": paginationInfo.pageCurrent,
                    "pageTotal": paginationInfo.pageTotal,
                    "chapter": (tocItem.parent ? (tocItem.parent.label + ", ") : "") + tocItem.label
                });

                this.bookmarksView.saveBookmark({
                    hash: this.model.get('hash'),
                    cfi: bookmarkInfo.contentCFI,
                    idref: bookmarkInfo.idref,
                    label: window.document.l10n.getSync('bookmarkLabel'),
                    rank: paginationInfo.chapterCurrent * 1000 + paginationInfo.pageCurrent
                });
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
                    request = sdcard.get(this.model.get('path')),
                    pageRequest = this.pageRequest,
                    attributes = this.model.attributes,
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

                        if (pageRequest.chapter && !pageRequest.cfi) {
                            epubData.chapter = pageRequest.chapter;
                        } else if (pageRequest.chapter && pageRequest.cfi) {
                            epubData.position = {
                                idref: pageRequest.chapter,
                                contentCFI: pageRequest.cfi
                            };
                        } else if (attributes.position) {
                            epubData.position = attributes.position;
                        }

                        epubData.fontSize = attributes.fontSize;
                        epubData.theme = attributes.theme;

                        sandbox.postMessage(epubData, "*");
                    }.bind(this);
                    reader.readAsArrayBuffer(this.result);
                };

                // set theme in options
                if (attributes.theme) {
                    this.optionsView.theme = attributes.theme;
                }

                // we need to better handle that
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
                var toc = new BookTocModel();
                toc.load(tocXml);

                this.tocView = new TocView({ model: toc, hash: this.model.get("hash") });
                this.tocView.render();

                this.paginationView.setToc(toc);

                this.$el.append(this.tocView.el);

                // first access to the book, we trust the first item of the toc
                if (!this.model.has('position')) {
                    this.openChapter(toc.getFirstItem().get('href'));
                }
            },

            showToc: function (event) {
                event.stopImmediatePropagation();
                this.clearUiTempo();

                if (this.tocView.toggle()) {
                    this.toolbarView.show();
                    this.optionsView.hide();
                    this.bookmarksView.hide();
                    this.paginationView.hide();
                } else {
                    this.hideToc();
                }
            },

            hideToc: function () {
                this.tocView.hide();
                this.toolbarView.hide();
            },

            showBookmarks: function (event) {
                event.stopImmediatePropagation();
                this.clearUiTempo();

                if (this.bookmarksView.toggle()) {
                    this.toolbarView.show();
                    this.optionsView.hide();
                    this.tocView.hide();
                    this.paginationView.hide();
                } else {
                    this.hideBookmarks();
                }
            },

            hideBookmarks: function () {
                this.bookmarksView.hide();
                this.toolbarView.hide();
            },

            setEbookTitle: function (title) {
                this.paginationView.model.set('title', title);
            },

            savePosition: function (currentPositionInfo) {
                this.model.set({
                    "position": currentPositionInfo,
                    "fontSize": this.optionsView.fontSize,
                    "theme": this.optionsView.theme
                }, { silent: true });
                this.model.save();
            },

            showOptions: function (event) {
                event.stopImmediatePropagation();
                this.clearUiTempo();

                if (this.optionsView.toggle()) {
                    this.toolbarView.show();
                    this.paginationView.show();
                    this.tocView.hide();
                    this.bookmarksView.hide();
                }
            },

            hideUi: function () {
                this.toolbarView.hide();
                this.optionsView.hide();
                this.tocView.hide();
                this.paginationView.hide();
                this.bookmarksView.hide();
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
        return BookView;
    });