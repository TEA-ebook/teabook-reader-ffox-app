/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, Backbone: true, EbookView: true*/
(function () {
    "use strict";
    describe('Ebook view', function () {
        var sandbox;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('call the render function when created', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.spy(EbookView.prototype, "render");
                    sandbox.stub(EbookView.prototype, "spin");

                    // Given an ebook view
                    var ebookView;

                    // When it is intanciated
                    ebookView = new EbookView({ model: new EbookModel() });
                    ebookView.close();

                    // It should call the render and spin functions
                    EbookView.prototype.render.should.have.been.calledOnce;
                    ebookView.$el.find("iframe").should.have.length(1);
                    EbookView.prototype.spin.should.have.been.calledOnce;

                    done();
                });
            });

            it('hides the toolbar after 5s', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.spy(EbookView.prototype, "hideToolbar");
                    sandbox.useFakeTimers();

                    // Given an ebook view with a loaded epub
                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "readyToRead" });

                    // When the toolbar is displayed and 5s passed
                    ebookView.displayToolbar();
                    sandbox.clock.tick(5000);

                    // The toolbar should be automatically hidden
                    ebookView.$el.find(".ebook-toolbar")[0].classList.contains("hidden").should.be.true;

                    ebookView.close();
                    sandbox.clock.restore();
                    done();
                });
            });

            it('should render a toolbar', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    // Given an ebook view
                    var ebookView;

                    // When it renders
                    ebookView = new EbookView({ model: new EbookModel() });

                    // It should render the toolbar
                    var toolbar = ebookView.$el.find("div.ebook-toolbar");
                    toolbar.should.have.length(1);

                    ebookView.close();
                    done();
                });
            });

            it('should navigate to the bookshelf when back button is pressed', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(Backbone.history, "navigate", checkRouterNav);

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When the user press the back button
                    ebookView.$el.find("button.back").click();

                    // It should navigates to the bookshelf
                    function checkRouterNav() {
                        if (arguments[0] === '/') {
                            done();
                        }
                    }
                });
            });
        });

        describe('should react to events :', function () {
            it('tap once -> display the toolbar', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.spy(EbookView.prototype, "displayToolbar");

                    // Given an ebook view with a loaded epub
                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "readyToRead" });

                    // When the user taps the screen
                    Backbone.trigger("message", { data: "tap" });

                    // The toolbar should be visible
                    EbookView.prototype.displayToolbar.should.have.been.calledOnce;
                    ebookView.$el.find(".ebook-toolbar").hasClass("hidden").should.be.false;

                    ebookView.close();
                    done();
                });
            });

            it('tap twice -> hide the toolbar if it\'s visible', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.spy(EbookView.prototype, "displayToolbar");

                    // Given an ebook view with a loaded epub
                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "readyToRead" });

                    // When the user taps twice the screen
                    Backbone.trigger("message", { data: "tap" });
                    Backbone.trigger("message", { data: "tap" });

                    // The toolbar should be hidden
                    EbookView.prototype.displayToolbar.should.have.been.calledTwice;
                    ebookView.$el.find(".ebook-toolbar").hasClass("hidden").should.be.true;

                    ebookView.close();
                    done();
                });
            });

            it('sendResources -> transfer the files to the sandbox', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "transferFile");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When a 'sendResources' event is triggered
                    Backbone.trigger("message", { data: "sendResources" });
                    ebookView.close();

                    // It should transfer the resources
                    EbookView.prototype.transferFile.should.have.been.calledOnce;

                    done();
                });
            });

            it('sendEpub -> send the epub to the sandbox', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "sendEpub");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When a 'sendEpub' event is triggered
                    Backbone.trigger("message", { data: "sendEpub" });
                    ebookView.close();

                    // It should send the epub
                    EbookView.prototype.sendEpub.should.have.been.calledOnce;

                    done();
                });
            });

            it('readyToRead -> toolbar hidden', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.spy(EbookView.prototype, "hideToolbar");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When the epub is loaded
                    Backbone.trigger("message", { data: "readyToRead" });

                    // The toolbar should be hidden
                    ebookView.$el.find(".ebook-toolbar").hasClass("hidden").should.be.true;

                    ebookView.close();
                    done();
                });
            });

            it('ContentDocumentLoadStart -> spinner got to spin', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "spin");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When readium starts loading the epub
                    Backbone.trigger("message", { data: "ContentDocumentLoadStart" });
                    ebookView.close();

                    // It should spin the spinner
                    EbookView.prototype.spin.should.have.been.calledTwice;

                    done();
                });
            });

            it('PaginationChanged -> spinner should stop spinning', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "stopSpin");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When readium has loaded the epub
                    Backbone.trigger("message", { data: "ContentDocumentLoaded" });
                    ebookView.close();

                    // It should stop the spinner
                    EbookView.prototype.stopSpin.should.have.been.calledOnce;

                    done();
                });
            });

            it('PaginationChanged -> spinner should stop spinning', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "stopSpin");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When readium has changed its pagination
                    Backbone.trigger("message", { data: "PaginationChanged" });
                    ebookView.close();

                    // It should stop the spinner
                    EbookView.prototype.stopSpin.should.have.been.calledOnce;

                    done();
                });
            });

            it('toc received -> generate html toc', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.spy(EbookView.prototype, "generateToc");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When readium sends the table of contents
                    Backbone.trigger("message", { data: { type: "toc", data: '<ncx><navMap><navPoint><navLabel><text>PIPO</text></navLabel><content src="plop.html" /></navPoint></navMap></ncx>' } });
                    ebookView.close();

                    // It should generate the html toc
                    EbookView.prototype.generateToc.should.have.been.calledOnce;
                    ebookView.tocView.$el.find(".ebook-toc-item").should.have.length(1);

                    done();
                });
            });
        });

        describe('should request and exit full screen :', function () {
            it('screen is visible -> request full screen', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "requestFullScreen");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When the dom becomes visible to the user
                    Backbone.trigger("visibility:visible");
                    ebookView.close();

                    // It should request full screen
                    EbookView.prototype.requestFullScreen.should.have.been.calledTwice;

                    done();
                });
            });

            it('view is closed -> exit full screen', function (done) {
                curl(['model/ebook', 'view/ebook/index'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "exitFullScreen");

                    // Given an ebook view
                    var ebookView = new EbookView({ model: new EbookModel() });

                    // When the view is closed
                    ebookView.close();

                    // It should exit full screen
                    EbookView.prototype.exitFullScreen.should.have.been.calledOnce;

                    done();
                });
            });
        });
    });
}());