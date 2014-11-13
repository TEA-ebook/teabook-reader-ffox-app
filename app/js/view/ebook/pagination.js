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
                if (event.type === "Readium:" + Teavents.Readium.PAGINATION_CHANGED) {
                    if (event.data) {
                        this.model.set({
                            chapterCurrent: (this.toc ? this.toc.getItemPosition(event.data.spineHref) : event.data.pageInfo.spineItemIndex + 1),
                            pageCurrent: event.data.pageInfo.spineItemPageIndex + 1,
                            pageTotal: event.data.pageInfo.spineItemPageCount
                        });
                    }
                } else if (event.type === "chapters") {
                    this.model.set("chapterTotal", event.data);
                }
            },

            render: function () {
                this.$el.html(template(this.model.attributes));
                return this;
            },

            setToc: function (toc) {
                this.toc = toc;
                this.model.set('chapterTotal', this.toc.getTotalEndPoints());
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