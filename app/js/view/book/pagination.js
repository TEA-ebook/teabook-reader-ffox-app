/*global define, Teavents, window*/
/*jslint stupid: true*/
define('view/book/pagination', ['backbone', 'template/book/pagination'],
    function (Backbone, template) {
        "use strict";

        var BookPaginationView = Backbone.View.extend({

            tagName: 'div',
            className: 'book-pagination',

            autoHideTimeout: 1500,

            events: {
                'click progress': 'moveToPage',
                'touchmove progress': 'displayPageDestination',
                'touchend progress': 'slideToPage'
            },

            initialize: function () {
                Backbone.on(Teavents.Readium.PAGINATION_CHANGED, this.pageChanged.bind(this));
                this.model.on("change", this.render, this);
            },

            pageChanged: function (data) {
                if (data) {
                    var item = false, position = false, chapterCurrent, chapterTotal = this.model.get('chapterTotal');
                    if (this.toc) {
                        item = this.toc.getItem(data.spineHref);
                        if (item) {
                            this.toc.setCurrentItem(item);
                            position = item.get("position");
                        }
                    }

                    chapterCurrent = (item && item.get("endPoint")) ? (position || (data.pageInfo.spineItemIndex)) : false;

                    if (chapterCurrent > chapterTotal) {
                        chapterTotal = false;
                    }

                    this.model.set({
                        chapterTotal: chapterTotal,
                        chapterCurrent: chapterCurrent,
                        pageCurrent: data.pageInfo.spineItemPageIndex + 1,
                        pageTotal: data.pageInfo.spineItemPageCount
                    });
                }
            },

            render: function () {
                this.$el.html(template(this.model.attributes));
                window.document.l10n.updateData({ "pageLeft": this.model.get('pageLeft') });
                window.document.l10n.localizeNode(this.el);
                this.pageInfoEl = this.$el.find(".book-pagination-page-destination");
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

                if (pageTotal > 1) {
                    pageValue = this.computePageValue(event.originalEvent.changedTouches[0], event);
                    percentage = Math.round(100 * pageValue / pageTotal);

                    window.document.l10n.updateData({ "pageCurrent": pageValue, "pageTotal": pageTotal });
                    this.pageInfoEl.html(window.document.l10n.getSync('pageNofTotal'));
                    if (percentage > 50) {
                        this.pageInfoEl.css('left', 'inherit');
                        this.pageInfoEl.css('right', (67 - Math.round(65 * pageValue / pageTotal)) + '%');
                    } else {
                        this.pageInfoEl.css('right', 'inherit');
                        this.pageInfoEl.css('left', Math.round(64 * pageValue / pageTotal) + '%');
                    }
                    this.pageInfoEl.show();

                    this.updateValue(pageValue);
                }
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
                Backbone.off(Teavents.Readium.PAGINATION_CHANGED);
                this.remove();
            }
        });

        return BookPaginationView;
    });