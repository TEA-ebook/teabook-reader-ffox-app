/*global define: true, Teavents: true*/
define('view/ebook/pagination', ['backbone', 'template/ebook/pagination'],
    function (Backbone, template) {
        "use strict";

        var EbookPaginationView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-pagination',

            initialize: function () {
                Backbone.on(Teavents.MESSAGE, this.readiumEvent.bind(this));
                this.model.on("change", this.render, this);
            },

            readiumEvent: function (event) {
                if (event.data.type === 'readium') {
                    var readiumEvent = event.data.event;
                    if (readiumEvent.type === "PaginationChanged") {
                        if (readiumEvent.data) {
                            this.model.set({
                                chapterCurrent: readiumEvent.data.spineItemIndex + 1,
                                pageCurrent: readiumEvent.data.spineItemPageIndex + 1,
                                pageTotal: readiumEvent.data.spineItemPageCount
                            });
                        }
                    }
                } else if (event.data.type === "chapters") {
                    this.model.set("chapterTotal", event.data.data);
                }
            },

            render: function () {
                this.$el.html(template(this.model.attributes));
                return this;
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    this.show();
                } else {
                    this.hide();
                }
            },

            show: function () {
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                return false;
            },

            close: function () {
                Backbone.off(Teavents.MESSAGE);
                this.remove();
            }
        });

        return EbookPaginationView;
    });