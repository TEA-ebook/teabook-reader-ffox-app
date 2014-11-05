/*global define: true*/
define("model/ebook-pagination", ["backbone"], function (Backbone) {
    "use strict";

    var EbookPaginationModel = Backbone.Model.extend({
        defaults: {
            chapterTotal: 0,
            chapterCurrent: 0,
            pageTotal: 0,
            pageCurrent: 0,
            chapterDelta: 0,
            fixedChapterTotal: 0,
            monoPage: false,
            title: ""
        },

        initialize: function () {
            this.computeProperties();
            this.set({ 'fixedChapterTotal': this.get('chapterTotal') }, { silent: true });
            this.on('change:pageCurrent', this.computeProperties, this);
            this.on('change:pageTotal', this.computeProperties, this);
            this.on('change:fixedChapterTotal', this.fixChapterTotal, this);
            this.on('change:chapterCurrent', this.fixChapterCurrent, this);
        },

        computeProperties: function () {
            this.set({ 'monoPage': (this.get('pageTotal') <= 1) }, { silent: true });
        },

        fixChapterTotal: function () {
            this.set({ 'chapterDelta': (this.get('chapterTotal') - this.get('fixedChapterTotal')) }, { silent: true });
            this.set({ 'chapterTotal': this.get('fixedChapterTotal') }, { silent: true });
        },

        fixChapterCurrent: function () {
            var fixedChapterCurrent = (this.get('chapterCurrent') - this.get('chapterDelta'));
            if (fixedChapterCurrent < 0) {
                this.set({ 'chapterCurrent': false }, { silent: true });
            } else {
                this.set({ 'chapterCurrent': (this.get('chapterCurrent') - this.get('chapterDelta')) }, { silent: true });
            }
        }
    });

    return EbookPaginationModel;
});