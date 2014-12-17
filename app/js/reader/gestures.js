/*global define, ReadiumSDK, window*/
/*jslint nomen: true*/

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

define('gestures', ['jquery', 'hammer', 'underscore'], function ($, Hammer, _) {
    "use strict";

    var gesturesHandler, onSwipe, onPinch, onPinchMove, onTap, computeFontSize, isGestureHandled, setupHammer;

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

        onTap = function (event) {
            if (!event.target.hasAttribute('href') && !event.target.parentNode.hasAttribute('href')) {
                reader.trigger(ReadiumSDK.Events.GESTURE_TAP);
            } else {
                $(event.target).click();
            }
        };

        onPinchMove = _.throttle(function (event) {
            reader.trigger(ReadiumSDK.Events.GESTURE_PINCH_MOVE, {
                "fontSize": computeFontSize(event.scale),
                "center": event.center,
                "timestamp": Date.now().toString()
            });
        }, 200);

        onPinch = function (event) {
            if (event.eventType === Hammer.INPUT_END) {
                reader.trigger(ReadiumSDK.Events.GESTURE_PINCH);

                setTimeout(function () {
                    reader.updateSettings({
                        fontSize: computeFontSize(event.scale)
                    });
                }, 50);
            } else if (event.eventType === Hammer.INPUT_MOVE) {
                onPinchMove(event);
            }
        };

        computeFontSize = function (eventScale) {
            var scale, fontSize;

            scale = isNaN(parseInt(eventScale, 10)) ? 1 : eventScale;
            fontSize = reader.viewerSettings().fontSize;

            if (scale < 1) {
                fontSize -= Math.round(30 / scale);
            } else {
                fontSize += Math.round(20 * scale);
            }

            if (fontSize < 50) {
                fontSize = 50;
            } else if (fontSize > 250) {
                fontSize = 250;
            }

            return fontSize;
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
/*jslint nomen: false*/