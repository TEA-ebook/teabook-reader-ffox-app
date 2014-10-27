/*global define: true, window: true*/
/*jslint nomen: true*/
define('helper/domEvents', ['backbone', 'underscore', 'jquery'], function (Backbone, _, $) {
    "use strict";
    var DomEvents = {};

    _.extend(DomEvents, Backbone.Events);

    DomEvents.initialize = function () {
        $(window).on("message", this.handleMessage);
        $(window.document).on("visibilitychange", this.handleVisibilityChange);

        this.listenTo(Backbone, "fullscreen:enter", this.enterFullScreen);
        this.listenTo(Backbone, "fullscreen:exit", this.exitFullScreen);
    };

    DomEvents.handleMessage = function (event) {
        Backbone.trigger("message", event.originalEvent);
    };

    DomEvents.handleVisibilityChange = function () {
        Backbone.trigger("visibility:" + (window.document.hidden ? "hidden" : "visible"));
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
        $(window).off("message");
        $(window.document).off("visibilitychange");
        this.stopListening(Backbone);
    };

    return DomEvents;
});
/*jslint nomen: false*/