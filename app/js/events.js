/*global window*/
window.Teavents = {
    MESSAGE: "message",
    VISIBILITY_HIDDEN: "visibility:hidden",
    VISIBILITY_VISIBLE: "visibility:visible",
    VISIBILITY_CHANGE: "visibilitychange",
    FULLSCREEN_ENTER: "fullscreen:enter",
    FULLSCREEN_EXIT: "fullscreen:exit",
    OPTIONS_CLOSED: "options:closed",
    EPUB_SEND: "sendEpub",
    READY_TO_READ: "readyToRead",
    SEND_RESOURCES: "sendResources",
    TOC: "toc",
    WORKING: "working",
    NOT_WORKING: "not_working",

    Readium: {
        PAGINATION_CHANGED: "PaginationChanged",
        CONTENT_LOAD_START: "ContentDocumentLoadStart",
        CONTENT_LOADED: "ContentDocumentLoaded",
        SETTINGS_APPLIED: "SettingsApplied",
        GESTURE_TAP: "GestureTap",
        GESTURE_PINCH_MOVE: "GesturePinchMove",
        GESTURE_PINCH: "GesturePinch"
    },

    Actions: {
        OPEN_EPUB: "open-epub",
        OPEN_CHAPTER: "open-chapter",
        OPEN_PAGE: "open-page",
        SET_FONT_SIZE: "font-size",
        SET_THEME: "set-theme"
    }
};