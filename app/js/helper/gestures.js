/*global define: true, ReadiumSDK: true, window: true*/

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

define('gestures', ['jquery', 'hammer'], function ($, Hammer) {
    "use strict";

    var gesturesHandler, onSwipe, onPinch, onTap, isGestureHandled, setupHammer;

    gesturesHandler = function (reader, viewport) {

        onSwipe = function (event) {
            if (event.direction === Hammer.DIRECTION_LEFT) {
                reader.trigger(ReadiumSDK.Events.GESTURE_SWIPE_LEFT);
                reader.openPageRight();
            } else if (event.direction === Hammer.DIRECTION_RIGHT) {
                reader.trigger(ReadiumSDK.Events.GESTURE_SWIPE_RIGHT);
                reader.openPageLeft();
            }
        };

        onTap = function () {
            reader.trigger(ReadiumSDK.Events.GESTURE_TAP);
            console.debug("tap iframe");
        };

        onPinch = function (event) {
            if (event.eventType === Hammer.INPUT_END) {
                reader.trigger(ReadiumSDK.Events.GESTURE_PINCH);

                var scale, fontSize;

                scale = isNaN(parseInt(event.scale, 10)) ? 1 : event.scale;
                fontSize = reader.viewerSettings().fontSize;

                if (scale < 1) {
                    fontSize -= Math.round(20 / scale);
                } else {
                    fontSize += Math.round(10 * scale);
                }

                if (fontSize < 50) {
                    fontSize = 50;
                } else if (fontSize > 250) {
                    fontSize = 250;
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

        setupHammer = function (element) {
            var hammertime = new Hammer(element, { prevent_mouseevents: true });
            hammertime.get('swipe').set({ threshold: 1, velocity: 0.1 });
            hammertime.get('pinch').set({ enable: true });

            // set up the hammer gesture events swiping handlers
            hammertime.on("swipeleft", onSwipe);
            hammertime.on("swiperight", onSwipe);
            hammertime.on("tap", onTap);
            hammertime.on("pinchin", onPinch);
            hammertime.on("pinchout", onPinch);

            return hammertime;
        };

        this.initialize = function () {
            reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function (iframe) {
                // set hammer's document root
                setupHammer(iframe[0].contentDocument.documentElement);
            });

            // remove stupid ipad safari elastic scrolling (improves UX for gestures)
            $(viewport).on(
                'touchmove',
                function (e) {
                    if (isGestureHandled()) {
                        e.preventDefault();
                    }
                }
            );

            // handlers on viewport
            setupHammer($(viewport)[0]);
        };

    };
    return gesturesHandler;
});