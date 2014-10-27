/*global describe: true, should: true, it: true, curl: true, sinon: true, window: true */

function fireEvent(element, event) {
    "use strict";
    var evt;
    var isString = function(it) {
        return typeof it == "string" || it instanceof String;
    }
    element = (isString(element)) ? document.getElementById(element) : element;
    if (document.createEventObject) {
        // dispatch for IE
        evt = document.createEventObject();
        return element.fireEvent('on' + event, evt)
    }
    else {
        // dispatch for firefox + others
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}

(function() {
    "use strict";
    describe('DomEvents module', function () {
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
            it('should handle visibility change events', function (done) {
                curl(['helper/domEvents'], function (DomEvents) {
                    sandbox.stub(DomEvents, "handleVisibilityChange");

                    DomEvents.initialize();
                    fireEvent(window.document, "visibilitychange");
                    DomEvents.stop();

                    DomEvents.handleVisibilityChange.should.have.been.calledOnce;

                    done();
                });
            });

            it('should handle postMessage events', function (done) {
                curl(['helper/domEvents'], function (DomEvents) {
                    sandbox.stub(DomEvents, "handleMessage");

                    DomEvents.initialize();
                    fireEvent(window, "message");
                    DomEvents.stop();

                    DomEvents.handleMessage.should.have.been.calledOnce;

                    done();
                });
            });

            it('should handle full screen requests', function (done) {
                curl(['helper/domEvents'], function (DomEvents) {
                    sandbox.stub(DomEvents, "enterFullScreen");
                    sandbox.stub(DomEvents, "exitFullScreen");

                    DomEvents.initialize();
                    Backbone.trigger("fullscreen:enter");
                    Backbone.trigger("fullscreen:exit");
                    DomEvents.stop();

                    DomEvents.enterFullScreen.should.have.been.calledOnce;
                    DomEvents.exitFullScreen.should.have.been.calledOnce;

                    done();
                });
            });
        });
    });
}());