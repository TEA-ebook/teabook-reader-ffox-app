/*global define: true, Teavents: true, window: true*/
define('view/ebook/pagination', ['backbone', 'template/ebook/pagination'],
    function (Backbone, template) {
        "use strict";

        var EbookPaginationView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-pagination',

            autoHideTimeout: 1500,

            events: {
                'click progress': 'moveToPage',
                'touchmove progress': 'displayPageDestination',
                'touchend progress': 'slideToPage'
            },

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
                this.pageInfoEl = this.$el.find(".ebook-pagination-page-destination");
                return this;
            },

            setToc: function (toc) {
                this.toc = toc;
                this.model.set('chapterTotal', this.toc.getTotalEndPoints());
            },

            moveToPage: function (event) {
                var pageValue = this.computePageValue(event);
                this.updateValue(pageValue, true);
                this.autoHide();
            },

            displayPageDestination: function (event) {
                var pageValue, pageTotal, percentage;
                pageTotal = this.model.get('pageTotal');
                pageValue = this.computePageValue(event.originalEvent.changedTouches[0], event);
                percentage = Math.round(100 * pageValue / pageTotal);

                // A faire : i18n this !
                this.pageInfoEl.html("Page " + pageValue + " sur " + pageTotal);
                if (percentage > 50) {
                    this.pageInfoEl.css('left', 'inherit');
                    this.pageInfoEl.css('right', (67 - Math.round(65 * pageValue / pageTotal)) + '%');
                } else {
                    this.pageInfoEl.css('right', 'inherit');
                    this.pageInfoEl.css('left', Math.round(64 * pageValue / pageTotal) + '%');
                }
                this.pageInfoEl.show();

                this.updateValue(pageValue);
            },

            slideToPage: function (event) {
                var pageValue = this.computePageValue(event.originalEvent.changedTouches[0], event);
                this.pageInfoEl.hide();
                Backbone.trigger(Teavents.WORKING);
                setTimeout(function () {
                    this.updateValue(pageValue, true);
                }.bind(this), 50);
            },

            computePageValue: function (touch, event) {
                if (event === undefined) {
                    event = touch;
                }

                var pageValue, pageTotal;
                pageTotal = this.model.get('pageTotal');
                pageValue = Math.round(pageTotal * ((touch.clientX - event.target.offsetLeft) / event.target.clientWidth)) + 1;

                if (pageValue <= 0) {
                    pageValue = 1;
                } else if (pageValue > pageTotal) {
                    pageValue = pageTotal;
                }

                return pageValue;
            },

            updateValue: function (value, goTo) {
                this.lastTouch = Date.now();
                this.model.set({ 'pageCurrent': value }, { silent: true });
                this.$el.find('progress').attr('value', value);
                if (goTo) {
                    Backbone.trigger(Teavents.Actions.OPEN_PAGE, value - 1);
                }
            },

            toggle: function () {
                if (this.$el[0].classList.contains("expanded")) {
                    this.hide();
                } else {
                    this.show();
                }
            },

            show: function () {
                this.$el[0].classList.add("expanded");
                this.cancelAutoHide();
                return true;
            },

            hide: function () {
                if (!this.lastTouch || (Date.now() - this.lastTouch > this.autoHideTimeout)) {
                    this.$el[0].classList.remove("expanded");
                    return false;
                }
                this.autoHide();
                return true;
            },

            autoHide: function () {
                this.cancelAutoHide();
                this.autoHideTimer = window.setTimeout(this.hide.bind(this), this.autoHideTimeout);
            },

            cancelAutoHide: function () {
                if (this.autoHideTimer) {
                    window.clearTimeout(this.autoHideTimer);
                    this.autoHideTimer = null;
                }
            },

            close: function () {
                Backbone.off(Teavents.MESSAGE);
                this.remove();
            }
        });

        return EbookPaginationView;
    });