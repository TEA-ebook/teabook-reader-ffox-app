/*global define, navigator, FileReader, window, alert, Teavents*/
/*jslint stupid: true*/
define('view/book/index',
    ['backbone',
        'helper/blobber',
        'helper/device',
        'helper/logger',
        'model/book-toc',
        'model/book-pagination',
        'view/book/bookmarks',
        'view/book/toolbar',
        'view/book/toc',
        'view/book/options',
        'view/book/pagination',
        'view/book/font-size-sample',
        'template/book/index',
        'template/waiting',
        'template/spinner'
        ],
    function (Backbone,
              Blobber,
              Device,
              Logger,
              BookTocModel,
              BookPaginationModel,
              BookmarksView,
              ToolbarView,
              TocView,
              OptionsView,
              PaginationView,
              FontSizeSampleView,
              template,
              waitingTemplate,
              spinnerTemplate) {
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
                // UI components
                this.paginationView = new PaginationView({ model: new BookPaginationModel() });
                this.toolbarView = new ToolbarView();
                this.optionsView = new OptionsView();
                this.bookmarksView = new BookmarksView({ hash: this.model.get('hash') });
                this.waitingTemplate = waitingTemplate();
                this.fontSizeSampleView = new FontSizeSampleView();

                // vars init
                this.pageRequest = options.pageRequest;

                // Backbone events
                this.listenToOnce(Backbone, 'destroy', this.close.bind(this));
                Backbone.on(Teavents.SEND_RESOURCES, this.sendResourcesToReader.bind(this));
                Backbone.on(Teavents.EPUB_SEND, this.sendEpub.bind(this));
                Backbone.on(Teavents.READY_TO_READ, this.readerReady.bind(this));
                Backbone.on(Teavents.TOC, this.generateToc.bind(this));
                Backbone.on(Teavents.PAGE_BOOKMARKED, this.saveBookmark.bind(this));
                Backbone.on(Teavents.CURRENT_POSITION, this.savePositionAndClose.bind(this));
                Backbone.on(Teavents.VISIBILITY_VISIBLE, this.requestFullScreen);
                Backbone.on(Teavents.OPTIONS_CLOSED, this.hideUi.bind(this));
                Backbone.on(Teavents.WORKING, this.displayBusyWheel.bind(this));
                Backbone.on(Teavents.NOT_WORKING, this.hideBusyWheel.bind(this));

                // Readium events
                Backbone.on(Teavents.Readium.GESTURE_TAP, this.displayUi.bind(this));
                Backbone.on(Teavents.Readium.CONTENT_LOAD_START, this.spin.bind(this));
                Backbone.on(Teavents.Readium.CONTENT_LOADED, this.stopSpin.bind(this));
                Backbone.on(Teavents.Readium.GESTURE_PINCH, this.displayBusyWheel.bind(this));
                Backbone.on(Teavents.Readium.PAGINATION_CHANGED, this.pageChange.bind(this));
                Backbone.on(Teavents.Readium.SETTINGS_APPLIED, this.settingsChanged.bind(this));

                // Backbone events for actions
                Backbone.on(Teavents.Actions.OPEN_CHAPTER, this.openChapter.bind(this));
                Backbone.on(Teavents.Actions.OPEN_PAGE, this.openPage.bind(this));
                Backbone.on(Teavents.Actions.OPEN_POSITION, this.openPosition.bind(this));
                Backbone.on(Teavents.Actions.SET_FONT_SIZE, this.changeFontSize.bind(this));
                Backbone.on(Teavents.Actions.SET_THEME, this.changeTheme.bind(this));
                Backbone.on(Teavents.Actions.BOOKMARK_PAGE, this.bookmarkPage.bind(this));

                // getting the book -> render it
                this.model.fetch({
                    success: this.render.bind(this)
                });
            },

            /**
             *
             * @returns {BookView}
             */
            render: function () {
                // open book in fullscreen
                this.requestFullScreen();

                // render toolbar
                this.toolbarView.render();
                this.$el.html(this.toolbarView.el);

                // render sanboxed iframe
                var attributes = {
                    host: window.Conf.host
                };
                if (!this.model.has('coverUrl') && this.model.has('cover')) { // with cover
                    Device.readFile(this.model.get("cover"), function (file) {
                        this.model.set('coverUrl', window.URL.createObjectURL(file));
                        attributes.book = this.model.attributes;
                        this.$el.append(template(attributes));
                    }.bind(this));
                } else {
                    attributes.book = this.model.attributes;
                    this.$el.append(template(attributes));
                }

                // iframe timeout (no internet connection)
                this.iframeTimeout = setTimeout(function () {
                    Backbone.history.navigate("noconnection", true);
                }, 2000);

                // render options
                this.optionsView.render();
                this.$el.append(this.optionsView.el);

                // render pagination
                this.$el.append(this.paginationView.el);

                // render bookmarks
                this.$el.append(this.bookmarksView.el);

                // render font size sample
                this.fontSizeSampleView.render();
                this.$el.append(this.fontSizeSampleView.el);

                // spinning wheel : book is indeed long to load
                this.$el.append(spinnerTemplate());
                this.spinner = this.$el.find(".loader");

                Logger.openBook(this.model.attributes);

                return this;
            },

            /**
             * Readium is ready in the iframe
             */
            readerReady: function () {
                this.$el.find(".book-loading-cover").remove();
            },

            /**
             * Displaying hidden UI (pagination, toolbar)
             */
            displayUi: function () {
                if (this.toolbarView.toggle()) {
                    this.paginationView.show();
                    this.startUiTempo();
                } else {
                    this.paginationView.hide();
                    this.clearUiTempo();
                }
            },

            hideUi: function () {
                this.toolbarView.hide();
                this.optionsView.hide();
                this.tocView.hide();
                this.paginationView.hide();
                this.bookmarksView.hide();
            },

            /**
             * Hide UI after 5s
             */
            startUiTempo: function () {
                this.uiTempo = setTimeout(this.hideUi.bind(this), this.autoHideTime);
            },

            clearUiTempo: function () {
                if (this.uiTempo) {
                    window.clearTimeout(this.uiTempo);
                    this.uiTempo = null;
                }
            },

            /**
             * Pagination changed in Readium
             */
            pageChange: function () {
                this.stopSpin();
                this.hideBusyWheel();

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.PAGE_CHANGED);
            },

            /**
             * Settings applied in Readium
             */
            settingsChanged: function () {
                this.hideBusyWheel();
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.SETTINGS_CHANGED, { fontSize: this.optionsView.fontSize });
            },

            /**
             * Display / hide app options view
             *
             * @param event
             */
            showOptions: function (event) {
                event.stopImmediatePropagation();
                this.clearUiTempo();

                if (this.optionsView.toggle()) {
                    this.toolbarView.show();
                    this.paginationView.show();
                    this.tocView.hide();
                    this.bookmarksView.hide();
                }

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.SHOW_OPTIONS);
            },

            /**
             * Table of contents generation from book <nav> or .ncx
             *
             * @param tocXml
             */
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

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.SHOW_TOC);
            },

            hideToc: function () {
                this.tocView.hide();
                this.toolbarView.hide();
            },

            /**
             * Bookmarks
             *
             * @param event
             */
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

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.SHOW_BOOKMARKS);
            },

            hideBookmarks: function () {
                this.bookmarksView.hide();
                this.toolbarView.hide();
            },

            /**
             * Bookmark page request in Readium to get CFI
             */
            bookmarkPage: function () {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.BOOKMARK_PAGE
                });

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.BOOKMARK_PAGE);
            },

            /**
             * Saving the CFI, current chapter label and page number in indexedDB
             *
             * @param bookmarkInfo
             */
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

            /**
             * User want to go back to bookcase :
             *  - save reading position & reader settings (theme, font size)
             *  - close view and Log event for analytics
             */
            backToBookcase: function () {
                // saving reading position first
                this.sendMessageToSandbox({
                    action: Teavents.Actions.GET_POSITION
                });

                Logger.closeBook(this.model.attributes);
            },

            savePositionAndClose: function (data) {
                this.savePosition(data);
                this.close();
                Backbone.history.navigate('/', true);
            },

            savePosition: function (currentPositionInfo) {
                if (this.model.has("coverUrl") && this.model.get("coverUrl").startsWith("blob")) {
                    this.model.unset("coverUrl", { silent: true });
                }
                this.model.set({
                    "position": currentPositionInfo,
                    "fontSize": this.optionsView.fontSize,
                    "theme": this.optionsView.theme,
                    "read": Date.now()
                }, { silent: true });
                this.model.save();
            },

            /**
             * Little spinning wheel for long actions
             */
            displayBusyWheel: function () {
                this.$el.append(this.waitingTemplate);
            },

            hideBusyWheel: function () {
                this.$el.find(".waiting").remove();
            },

            /**
             * Full screen when reading a book
             */
            requestFullScreen: function () {
                Backbone.trigger(Teavents.FULLSCREEN_ENTER);
            },

            exitFullScreen: function () {
                Backbone.trigger(Teavents.FULLSCREEN_EXIT);
            },

            /**
             * Readium like spinner for book loading
             */
            spin: function () {
                this.spinner.css('visibility', 'visible');
            },

            stopSpin: function () {
                this.spinner.css('visibility', 'hidden');
            },


            /** **********************************************************************************/
            /** ********************** iFrame post message communication *************************/
            /** **********************************************************************************/

            getSandbox: function () {
                if (!this.sandbox) {
                    this.sandbox = this.$el.find('iframe')[0].contentWindow;
                }
                return this.sandbox;
            },

            sendMessageToSandbox: function (message) {
                var sandbox = this.getSandbox();
                if (sandbox !== null) {
                    sandbox.postMessage(message, "*");
                }
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
                    alert(this.model.get('title') + window.document.l10n.getSync('fileNotOnSdCardError'));
                    this.model.destroy();
                    Backbone.history.navigate('/', true);
                }.bind(this);
            },

            /**
             * We send the js code to the iframe (with Readium inside)
             */
            sendResourcesToReader: function () {
                clearTimeout(this.iframeTimeout);
                this.transferFile("js/readium.js", "text/javascript", this.getSandbox());
            },

            changeFontSize: function (fontSize) {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.SET_FONT_SIZE,
                    content: fontSize
                });

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.CHANGE_FONT_SIZE, { "fontSize": fontSize });
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

            changeTheme: function (theme) {
                this.sendMessageToSandbox({
                    action: Teavents.Actions.SET_THEME,
                    content: theme
                });

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.CHANGE_THEME, { "theme": theme });
            },


            /**
             * Removing all event listeners & removing all UI
             */
            close: function () {
                Backbone.off(Teavents.SEND_RESOURCES);
                Backbone.off(Teavents.EPUB_SEND);
                Backbone.off(Teavents.READY_TO_READ);
                Backbone.off(Teavents.TOC);
                Backbone.off(Teavents.PAGE_BOOKMARKED);
                Backbone.off(Teavents.CURRENT_POSITION);

                Backbone.off(Teavents.Readium.GESTURE_TAP);
                Backbone.off(Teavents.Readium.CONTENT_LOAD_START);
                Backbone.off(Teavents.Readium.CONTENT_LOADED);
                Backbone.off(Teavents.Readium.GESTURE_PINCH);
                Backbone.off(Teavents.Readium.PAGINATION_CHANGED);
                Backbone.off(Teavents.Readium.SETTINGS_APPLIED);

                Backbone.off(Teavents.VISIBILITY_VISIBLE);
                Backbone.off(Teavents.OPTIONS_CLOSED);

                Backbone.off(Teavents.WORKING);
                Backbone.off(Teavents.NOT_WORKING);

                Backbone.off(Teavents.Actions.OPEN_CHAPTER);
                Backbone.off(Teavents.Actions.OPEN_PAGE);
                Backbone.off(Teavents.Actions.OPEN_POSITION);
                Backbone.off(Teavents.Actions.SET_FONT_SIZE);
                Backbone.off(Teavents.Actions.SET_THEME);
                Backbone.off(Teavents.Actions.BOOKMARK_PAGE);

                this.exitFullScreen();

                this.fontSizeSampleView.remove();
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