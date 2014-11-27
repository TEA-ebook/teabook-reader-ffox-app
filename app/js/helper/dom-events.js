/*global define, window, Teavents*/
/*jslint nomen: true*/
define('helper/dom-events', ['backbone', 'underscore', 'jquery'], function (Backbone, _, $) {
    "use strict";
    var DomEvents = {};

    _.extend(DomEvents, Backbone.Events);

    DomEvents.initialize = function () {
        $(window).on(Teavents.MESSAGE, this.handleMessage);
        $(window.document).on(Teavents.VISIBILITY_CHANGE, this.handleVisibilityChange);

        this.listenTo(Backbone, Teavents.FULLSCREEN_ENTER, this.enterFullScreen);
        this.listenTo(Backbone, Teavents.FULLSCREEN_EXIT, this.exitFullScreen);
    };

    DomEvents.handleMessage = function (event) {
        Backbone.trigger(Teavents.MESSAGE, event.originalEvent.data);
    };

    DomEvents.handleVisibilityChange = function () {
        Backbone.trigger((window.document.hidden ? Teavents.VISIBILITY_HIDDEN : Teavents.VISIBILITY_VISIBLE));
    };

    DomEvents.enterFullScreen = function () {
        // full screen on body element
        var body = window.document.body;
        if (!window.document.fullscreenElement && !window.document.mozFullScreenElement && !window.document.webkitFullscreenElement) {
            if (body.requestFullscreen) {
                body.requestFullscreen();
            } else if (body.mozRequestFullScreen) {
                body.mozRequestFullScreen();
            } else if (body.webkitRequestFullscreen) {
                body.webkitRequestFullscreen();
            }
        }
    };

    DomEvents.exitFullScreen = function () {
        if (window.document.fullscreenElement || window.document.mozFullScreenElement || window.document.webkitFullscreenElement) {
            if (window.document.exitFullscreen) {
                window.document.exitFullscreen();
            } else if (window.document.mozCancelFullScreen) {
                window.document.mozCancelFullScreen();
            } else if (window.document.webkitExitFullscreen) {
                window.document.webkitExitFullscreen();
            }
        }
    };

    DomEvents.stop = function () {
        $(window).off(Teavents.MESSAGE);
        $(window.document).off(Teavents.VISIBILITY_CHANGE);
        this.stopListening(Backbone);
    };

    return DomEvents;
});
/*jslint nomen: false*/