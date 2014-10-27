/*global describe: true, should: true, it: true, curl: true, sinon: true, $: true, Backbone: true, EbookView: true*/
(function() {
    "use strict";
    describe('Ebook view', function () {
        var sandbox;

        beforeEach(function() {
            // create a sandbox
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('is a Backbone.View', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    var ebookView = new EbookView({ model: new EbookModel() });
                    ebookView.close();

                    ebookView.should.be.an.instanceof(Backbone.View);

                    done();
                });
            });

            it('call the render function when created', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.spy(EbookView.prototype, "render");
                    sandbox.stub(EbookView.prototype, "spin");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    ebookView.close();

                    EbookView.prototype.render.should.have.been.calledOnce;
                    EbookView.prototype.spin.should.have.been.calledOnce;

                    done();
                });
            });

            it('hides the toolbar after 4s', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "hideToolbar");

                    sandbox.useFakeTimers();

                    var ebookView = new EbookView({ model: new EbookModel() });
                    ebookView.displayToolbar();
                    sandbox.clock.tick(4000);

                    ebookView.close();

                    EbookView.prototype.hideToolbar.should.have.been.calledOnce;

                    sandbox.clock.restore();

                    done();
                });
            });

            it('should navigate to the bookshelf when back button is pressed', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(Backbone.history, "navigate", function() {
                        if(arguments[0] === '/') {
                            done();
                        }
                    });

                    var ebookView = new EbookView({ model: new EbookModel() });
                    ebookView.$el.find("button.back").click();
                });
            });
        });

        describe('should react to message events :', function () {
            it('tap/click -> display the toolbar', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "displayToolbar");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "tap" });
                    Backbone.trigger("message", { data: "click" });
                    ebookView.close();

                    EbookView.prototype.displayToolbar.should.have.been.calledTwice;

                    done();
                });
            });

            it('sendResources -> transfer the files to the sandbox', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "transferFile");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "sendResources" });
                    ebookView.close();

                    EbookView.prototype.transferFile.should.have.been.calledOnce;

                    done();
                });
            });

            it('sendEpub -> send the epub to the sandbox', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "sendEpub");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "sendEpub" });
                    ebookView.close();

                    EbookView.prototype.sendEpub.should.have.been.calledOnce;

                    done();
                });
            });

            it('readyToRead -> hide the toolbar', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "hideToolbar");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "readyToRead" });
                    ebookView.close();

                    EbookView.prototype.hideToolbar.should.have.been.calledOnce;

                    done();
                });
            });

            it('ContentDocumentLoadStart -> spinner got to spin', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "spin");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "ContentDocumentLoadStart" });
                    ebookView.close();

                    EbookView.prototype.spin.should.have.been.calledTwice;

                    done();
                });
            });

            it('ContentDocumentLoaded/PaginationChanged -> spinner should stop spinning', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "stopSpin");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("message", { data: "ContentDocumentLoaded" });
                    Backbone.trigger("message", { data: "PaginationChanged" });
                    ebookView.close();

                    EbookView.prototype.stopSpin.should.have.been.calledTwice;

                    done();
                });
            });
        });

        describe('should request and exit full screen :', function () {
            it('screen is visible -> request full screen', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "requestFullScreen");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    Backbone.trigger("visibility:visible");
                    ebookView.close();

                    EbookView.prototype.requestFullScreen.should.have.been.calledTwice;

                    done();
                });
            });

            it('view is closed -> exit full screen', function (done) {
                curl(['model/ebook', 'view/ebook'], function (EbookModel, EbookView) {
                    sandbox.stub(EbookView.prototype, "exitFullScreen");

                    var ebookView = new EbookView({ model: new EbookModel() });
                    ebookView.close();

                    EbookView.prototype.exitFullScreen.should.have.been.calledOnce;

                    done();
                });
            });
        });
    });
}());