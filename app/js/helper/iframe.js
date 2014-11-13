/*global window: true, Teavents: true, Blob: true, ReadiumSDK: true, readiumReady: true*/
"use strict";

var readiumReadyTest, isReadiumReady, handleMessage;

/**
 * Handle postMessage communication
 *
 * @param event
 */
handleMessage = function (event) {
    if (event.data.action === "chapter") {
        window.readium.reader.openContentUrl(event.data.content);
    } else if (event.data.action === "font-size") {
        window.readium.reader.updateSettings({
            fontSize: event.data.content
        });
    } else if (event.data.action === "epub") {
        var epubFile, openPageRequest;
        epubFile = new Blob([event.data.content], { "type": event.data.type });

        openPageRequest = false;
        if (event.data.chapter && event.data.chapter.length > 0) {
            openPageRequest = {
                contentRefUrl: event.data.chapter,
                sourceFileHref: "."
            };
        }

        window.readium.openPackageDocument(epubFile, function (packageDocument, options) {
            window.parent.postMessage({ type: "chapters", data: packageDocument.spineLength() }, "*");
            window.parent.postMessage({ type: "title", data: options.metadata.title }, "*");
            packageDocument.getTocText(function (toc) {
                window.parent.postMessage({ type: "toc", data: toc }, "*");
                window.parent.postMessage(Teavents.READY_TO_READ, "*");
            });
        }, openPageRequest);
    }
};

/**
 * Test if Readium is fully loaded
 */
isReadiumReady = function () {
    if (window.require !== undefined && window.readiumReady !== undefined) {
        clearInterval(readiumReadyTest);

        require(['Readium', 'gestures'], function (Readium, GesturesHandler) {
            var readerOptions, gesturesHandler;

            readerOptions = { el: '#epub-reader-frame' };
            window.readium = new Readium({ jsLibRoot: "" }, readerOptions, function (error) {
                console.error(error);
            });

            // setup gestures support with hammer
            gesturesHandler = new GesturesHandler(window.readium.reader, readerOptions.el);
            gesturesHandler.initialize();

            // transfer pagination info to the app
            window.readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData) {
                window.parent.postMessage({
                    type: "readium",
                    event: {
                        type: ReadiumSDK.Events.PAGINATION_CHANGED,
                        data: {
                            pageInfo: pageChangeData.paginationInfo.openPages[0],
                            spineHref: window.readium.reader.getLoadedSpineItems()[0].href
                        }
                    }
                }, "*");
            });

            // transfer updated settings
            window.readium.reader.on(ReadiumSDK.Events.SETTINGS_APPLIED, function () {
                window.parent.postMessage({
                    type: "readium",
                    event: {
                        type: ReadiumSDK.Events.SETTINGS_APPLIED,
                        data: {
                            fontSize: window.readium.reader.viewerSettings().fontSize
                        }
                    }
                }, "*");
            });

            // transfer selected Readium events to the app
            [
                ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START,
                ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED,
                ReadiumSDK.Events.GESTURE_PINCH,
                ReadiumSDK.Events.GESTURE_TAP
            ].forEach(function (event) {
                window.readium.reader.on(event, function () {
                    window.parent.postMessage({
                        type: "readium",
                        event: {
                            type: event
                        }
                    }, "*");
                });
            });

            // request epub data
            window.parent.postMessage(Teavents.EPUB_SEND, "*");
        });
    }
};


// Wait for Readium and postMessage communication
readiumReadyTest = setInterval(isReadiumReady, 100);
window.addEventListener("message", handleMessage, false);