/*global describe, beforeEach, afterEach, should, it, curl, sinon, $, Backbone, Teavents, Logger, window*/
(function () {
    "use strict";
    describe('Book view', function () {
        var sandbox;
        var fakeTocNcx = '<ncx><navMap><navPoint><navLabel><text>PIPO</text></navLabel><content src="plop.html" /></navPoint></navMap></ncx>';

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // stub fetch
            sandbox.stub(Backbone.Model.prototype, "fetch", function (options) {
                if (options && options.success) {
                    options.success();
                }
            });
            sandbox.stub(Backbone.Model.prototype, "save", function (options) {
                if (options && options.success) {
                    options.success();
                }
            });
            sandbox.stub(Backbone.Collection.prototype, "fetch", function (options) {
                if (options && options.success) {
                    options.success();
                }
            });
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        var triggerTap = function (x, y) {
            Backbone.trigger(Teavents.Readium.GESTURE_TAP, { x: x || Math.round(window.screen.availWidth / 2), y: y || Math.round(window.screen.availHeight / 2) });
        };

        describe('instance', function () {
            it('should check the sd card avalaibility and render when created', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });
                    sandbox.spy(BookView.prototype, "render");

                    // Given an book view
                    var bookView;

                    // When it is intanciated
                    bookView = new BookView({ model: new BookModel() });
                    bookView.close();

                    // It should have checked the sd card availability
                    Device.checkSdCardAvailability.should.have.been.calledOnce;

                    // And it should have call the render function
                    BookView.prototype.render.should.have.been.calledOnce;
                    bookView.$el.find("iframe").should.have.length(1);

                    done();
                });
            });

            it('hides the toolbar after 5s', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.useFakeTimers();
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });

                    // Given a book view with a loaded epub
                    var bookView = new BookView({ model: new BookModel({ hash: "fsf56f4sd54fsdf4sd5" }) });
                    Backbone.trigger(Teavents.TOC, fakeTocNcx);
                    Backbone.trigger(Teavents.READY_TO_READ);

                    // When the user tap once the screen and waits for 5s
                    triggerTap();
                    sandbox.clock.tick(5000);

                    // The toolbar should be automatically hidden
                    bookView.$el.find(".toolbar")[0].classList.contains("hidden").should.be.true;

                    bookView.close();
                    sandbox.clock.restore();
                    done();
                });
            });

            it('should render a toolbar', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });

                    // Given a book view
                    var bookView;

                    // When it renders
                    bookView = new BookView({ model: new BookModel() });

                    // It should render the toolbar
                    var toolbar = bookView.$el.find("div.toolbar");
                    toolbar.should.have.length(1);

                    bookView.close();
                    done();
                });
            });

            it('should navigate to the bookcase when back button is pressed', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });
                    sandbox.stub(Backbone.history, "navigate", checkRouterNav);
                    sandbox.stub(BookView.prototype, "backToBookcase", function() {
                        Backbone.trigger(Teavents.CURRENT_POSITION, {});
                    });

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When the user press the back button
                    bookView.$el.find("button.back").click();

                    // It should navigates to the bookshelf
                    function checkRouterNav () {
                        if (arguments[0] === '/') {
                            done();
                        }
                    }
                });
            });
        });

        describe('should react to events :', function () {
            it('tap once -> display the toolbar', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });

                    // Given a book view with a loaded epub
                    var bookView = new BookView({ model: new BookModel() });
                    Backbone.trigger(Teavents.READY_TO_READ);

                    // When the user taps the screen
                    triggerTap();

                    // The toolbar should be visible
                    bookView.$el.find(".toolbar").hasClass("hidden").should.be.false;

                    bookView.close();
                    done();
                });
            });

            it('tap twice -> hide the toolbar if it\'s visible', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });

                    // Given a book view with a loaded epub
                    var bookView = new BookView({ model: new BookModel() });
                    Backbone.trigger(Teavents.READY_TO_READ);

                    // When the user taps twice the screen
                    triggerTap();
                    triggerTap();

                    // The toolbar should be hidden
                    bookView.$el.find(".toolbar").hasClass("hidden").should.be.true;

                    bookView.close();
                    done();
                });
            });

            it('sendResources -> transfer the files to the sandbox', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });
                    sandbox.stub(BookView.prototype, "transferFile");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When a 'sendResources' event is triggered
                    Backbone.trigger(Teavents.SEND_RESOURCES);

                    // It should transfer the resources
                    BookView.prototype.transferFile.should.have.been.calledOnce;

                    bookView.close();
                    done();
                });
            });

            it('sendEpub -> send the epub to the sandbox', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });
                    sandbox.stub(BookView.prototype, "sendEpub");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When a 'sendEpub' event is triggered
                    Backbone.trigger(Teavents.EPUB_SEND);
                    bookView.close();

                    // It should send the epub
                    BookView.prototype.sendEpub.should.have.been.calledOnce;

                    done();
                });
            });

            it('readyToRead -> book cover removed', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When the epub is loaded
                    Backbone.trigger(Teavents.READY_TO_READ);

                    // The cover must be removed
                    bookView.$el.find(".book-loading-cover").should.have.length(0);

                    bookView.close();
                    done();
                });
            });

            it('ContentDocumentLoadStart -> spinner got to spin', function (done) {
                curl(['model/book', 'view/book/index'], function (BookModel, BookView) {
                    sandbox.stub(BookView.prototype, "spin");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When readium starts loading the epub
                    Backbone.trigger(Teavents.Readium.CONTENT_LOAD_START);
                    bookView.close();

                    // It should spin the spinner
                    BookView.prototype.spin.should.have.been.calledOnce;

                    done();
                });
            });

            it('ContentDocumentLoaded -> spinner should stop spinning', function (done) {
                curl(['model/book', 'view/book/index'], function (BookModel, BookView) {
                    sandbox.stub(BookView.prototype, "stopSpin");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When readium has loaded the epub
                    Backbone.trigger(Teavents.Readium.CONTENT_LOADED);
                    bookView.close();

                    // It should stop the spinner
                    BookView.prototype.stopSpin.should.have.been.calledOnce;

                    done();
                });
            });

            it('PaginationChanged -> spinner should stop spinning', function (done) {
                curl(['model/book', 'view/book/index'], function (BookModel, BookView) {
                    sandbox.stub(BookView.prototype, "stopSpin");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When readium has changed its pagination
                    Backbone.trigger(Teavents.Readium.PAGINATION_CHANGED);
                    bookView.close();

                    // It should stop the spinner
                    BookView.prototype.stopSpin.should.have.been.calledOnce;

                    done();
                });
            });

            it('toc received -> generate html toc', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });
                    sandbox.spy(BookView.prototype, "generateToc");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When readium sends the table of contents
                    Backbone.trigger(Teavents.TOC, fakeTocNcx);
                    bookView.close();

                    // It should generate the html toc
                    BookView.prototype.generateToc.should.have.been.calledOnce;
                    bookView.tocView.$el.find(".book-toc-item").should.have.length(1);

                    done();
                });
            });
        });

        describe('should request and exit full screen :', function () {
            it('screen is visible -> request full screen', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });
                    sandbox.stub(BookView.prototype, "requestFullScreen");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When the dom becomes visible to the user
                    Backbone.trigger(Teavents.VISIBILITY_VISIBLE);
                    bookView.close();

                    // It should request full screen
                    BookView.prototype.requestFullScreen.should.have.been.calledTwice;

                    done();
                });
            });

            it('view is closed -> exit full screen', function (done) {
                curl(['model/book', 'view/book/index'], function (BookModel, BookView) {
                    sandbox.stub(BookView.prototype, "exitFullScreen");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When the view is closed
                    bookView.close();

                    // It should exit full screen
                    BookView.prototype.exitFullScreen.should.have.been.calledOnce;

                    done();
                });
            });
        });

        describe('should navigate with left/right tap/keystroke :', function () {
            it('tap on the left of the screen -> request previous page', function (done) {
                curl(['model/book', 'helper/device', 'view/book/index'], function (BookModel, Device, BookView) {
                    sandbox.stub(Device, "checkSdCardAvailability", function (cb) {
                        cb();
                    });
                    sandbox.stub(BookView.prototype, "prevPage");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When the user taps the left of the screen
                    triggerTap(5, null);
                    bookView.close();

                    // It should request previous page
                    BookView.prototype.prevPage.should.have.been.calledOnce;

                    done();
                });
            });

            it('tap on the right of the screen -> request next page', function (done) {
                curl(['model/book', 'view/book/index'], function (BookModel, BookView) {
                    sandbox.stub(BookView.prototype, "nextPage");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When the user taps the right of the screen
                    triggerTap(window.screen.availWidth - 5, null);
                    bookView.close();

                    // It should request next page
                    BookView.prototype.nextPage.should.have.been.calledOnce;

                    done();
                });
            });

            it('tap on the center of the screen -> no next/prev page requested', function (done) {
                curl(['model/book', 'view/book/index'], function (BookModel, BookView) {
                    sandbox.stub(BookView.prototype, "prevPage");
                    sandbox.stub(BookView.prototype, "nextPage");

                    // Given a book view
                    var bookView = new BookView({ model: new BookModel() });

                    // When the user taps the center of the screen
                    triggerTap();
                    bookView.close();

                    // It should not request previous or next page
                    BookView.prototype.nextPage.should.not.have.been.called;
                    BookView.prototype.prevPage.should.not.have.been.called;

                    done();
                });
            });
        });
    });
}());