/*global define: true*/
define("model/ebook-pagination", ["backbone"], function (Backbone) {
    "use strict";

    var EbookPaginationModel = Backbone.Model.extend({
        defaults: {
            chapterTotal: 0,
            chapterCurrent: 0,
            pageTotal: 0,
            pageCurrent: 0,
            pageDisplayed: false
        },

        initialize: function () {
            this.updatePageDisplayed();
            this.on('change:pageCurrent', this.updatePageDisplayed, this);
            this.on('change:pageTotal', this.updatePageDisplayed, this);
        },

        updatePageDisplayed: function () {
            this.set({ 'pageDisplayed': (this.get('pageTotal') > 0) }, { silent: true });
        }
    });

    return EbookPaginationModel;
});