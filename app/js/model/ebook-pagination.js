/*global define: true*/
define("model/ebook-pagination", ["backbone"], function (Backbone) {
    "use strict";

    var EbookPaginationModel = Backbone.Model.extend({
        defaults: {
            chapterTotal: 0,
            chapterCurrent: 0,
            pageTotal: 0,
            pageCurrent: 0,
            monoPage: false
        },

        initialize: function () {
            this.computeProperties();
            this.on('change:pageCurrent', this.computeProperties, this);
            this.on('change:pageTotal', this.computeProperties, this);
        },

        computeProperties: function () {
            this.set({ 'monoPage': (this.get('pageTotal') <= 1) }, { silent: true });
        }
    });

    return EbookPaginationModel;
});