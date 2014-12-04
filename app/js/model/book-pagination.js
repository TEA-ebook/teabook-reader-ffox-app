/*global define*/
define("model/book-pagination", ["backbone"], function (Backbone) {
    "use strict";

    var BookPaginationModel = Backbone.Model.extend({
        defaults: {
            chapterTotal: 0,
            chapterCurrent: 0,
            pageTotal: 0,
            pageCurrent: 0,
            monoPage: false,
            title: ""
        },

        initialize: function () {
            this.computeProperties();
            this.on('change:pageCurrent', this.computeProperties, this);
            this.on('change:pageTotal', this.computeProperties, this);
        },

        computeProperties: function () {
            this.set({ 'monoPage': (this.get('pageTotal') <= 1) }, { silent: true });
            this.set({ 'pageLeft': (this.get('pageTotal') - this.get('pageCurrent')) }, { silent: true });
            this.set({ 'onePageLeft': (this.get('pageLeft') === 1) }, { silent: true });
            this.set({ 'lastPage': (this.get('pageLeft') === 0) }, { silent: true });
        }
    });

    return BookPaginationModel;
});