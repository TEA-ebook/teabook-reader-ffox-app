/*global define: true, ReadiumSDK: true, window: true, SwipeRecognizer: true*/

//  Copyright (c) 2014 Readium Foundation and/or its licensees. All rights reserved.
//
//  Redistribution and use in source and binary forms, with or without modification,
//  are permitted provided that the following conditions are met:
//  1. Redistributions of source code must retain the above copyright notice, this
//  list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation and/or
//  other materials provided with the distribution.
//  3. Neither the name of the organization nor the names of its contributors may be
//  used to endorse or promote products derived from this software without specific
//  prior written permission.

define('gestures', ['jquery', 'hammer', 'jquery_hammer'], function ($, Hammer) {
    "use strict";

    var gesturesHandler, onSwipeLeft, onSwipeRight, onPinchIn, onPinchOut, isGestureHandled;

    gesturesHandler = function (reader, viewport) {

        onSwipeLeft = function () {
            reader.openPageRight();
        };

        onSwipeRight = function () {
            reader.openPageLeft();
        };

        onPinchIn = function (event) {
            if (event.eventType === Hammer.INPUT_END) {
                window.parent.postMessage("pinchin", "*");

                var scale, fontSize;

                scale = isNaN(parseInt(event.scale, 10)) ? 1 : event.scale;
                fontSize = reader.viewerSettings().fontSize;
                fontSize -= Math.round(20 / scale);

                if (fontSize < 50) {
                    fontSize = 50;
                }
                setTimeout(function () {
                    reader.updateSettings({
                        fontSize: fontSize
                    });
                }, 50);
            }
        };

        onPinchOut = function (event) {
            if (event.eventType === Hammer.INPUT_END) {
                window.parent.postMessage("pinchout", "*");

                var scale, fontSize;

                scale = isNaN(parseInt(event.scale, 10)) ? 1 : event.scale;
                fontSize = reader.viewerSettings().fontSize;
                fontSize += Math.round(10 * scale);

                if (fontSize > 300) {
                    fontSize = 300;
                }
                setTimeout(function () {
                    reader.updateSettings({
                        fontSize: fontSize
                    });
                }, 50);
            }
        };

        isGestureHandled = function () {
            var viewType = reader.getCurrentViewType();

            return viewType === ReadiumSDK.Views.ReaderView.VIEW_TYPE_FIXED || viewType === ReadiumSDK.Views.ReaderView.VIEW_TYPE_COLUMNIZED;
        };

        this.initialize = function () {

            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function (iframe) {
                //set hammer's document root
                var hammertime = new Hammer(iframe[0].contentDocument.documentElement, { prevent_mouseevents: true });
                hammertime.get('swipe').set({ threshold: 1, velocity: 0.1 });
                hammertime.get('pinch').set({ enable: true });

                //set up the hammer gesture events swiping handlers
                hammertime.on("swipeleft", onSwipeLeft);
                hammertime.on("swiperight", onSwipeRight);
                hammertime.on("tap", function () {
                    window.parent.postMessage("tap", "*");
                });
                hammertime.on("pinchin", onPinchIn);
                hammertime.on("pinchout", onPinchOut);
            });

            //remove stupid ipad safari elastic scrolling (improves UX for gestures)
            $(viewport).on(
                'touchmove',
                function (e) {
                    if (isGestureHandled()) {
                        e.preventDefault();
                    }
                }
            );

            //handlers on viewport
            $(viewport).hammer().on("swipeleft", onSwipeLeft);
            $(viewport).hammer().on("swiperight", onSwipeRight);
            $(viewport).hammer().on("pinchin", onPinchIn);
            $(viewport).hammer().on("pinchout", onPinchOut);
        };

    };
    return gesturesHandler;
});