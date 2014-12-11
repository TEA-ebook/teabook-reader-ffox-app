/*global window*/
window.Teavents = {
    MESSAGE: "message",
    VISIBILITY_HIDDEN: "visibility:hidden",
    VISIBILITY_VISIBLE: "visibility:visible",
    VISIBILITY_CHANGE: "visibilitychange",
    FULLSCREEN_ENTER: "fullscreen:enter",
    FULLSCREEN_EXIT: "fullscreen:exit",
    FREEZE_BODY: "body:freeze",
    UNFREEZE_BODY: "body:unfreeze",
    OPTIONS_CLOSED: "options:closed",
    EPUB_SEND: "sendEpub",
    READY_TO_READ: "readyToRead",
    SEND_RESOURCES: "sendResources",
    TOC: "toc",
    WORKING: "working",
    NOT_WORKING: "not-working",
    PAGE_BOOKMARKED: "page-bookmarked",
    CURRENT_POSITION: "current-position",
    SCAN_FINISHED: "scan-finished",

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
        BOOKMARK_PAGE: "bookmark-page",
        GET_POSITION: "get-position",
        OPEN_EPUB: "open-epub",
        OPEN_CHAPTER: "open-chapter",
        OPEN_PAGE: "open-page",
        OPEN_POSITION: "open-position",
        SET_FONT_SIZE: "font-size",
        SET_THEME: "set-theme"
    }
};