/*global define, window, Teavents*/
/*jslint unparam: true*/
define('view/book/toc-item', ['backbone', 'template/book/toc-item'],
    function (Backbone, template) {
        "use strict";

        var BookTocItemView = Backbone.View.extend({

            tagName: 'li',
            className: 'book-toc-item',

            events: {
                "click .book-toc-item-toggle": "toggleChildren",
                "click": "highlightItem"
            },

            initialize: function () {
                this.model.on("change:current", this.setCurrent.bind(this));
            },

            render: function (hash) {
                var children = this.model.get("items");

                this.hash = hash;
                this.$el.html(template({
                    label: this.model.get('label'),
                    href: window.encodeURIComponent(this.model.get('href')),
                    level: this.model.get('level'),
                    hash: hash,
                    current: this.model.get('current'),
                    hasChildren: children.length > 0
                }));

                this.childrenEl = this.$el.find('ul');
                this.model.get("items").forEach(this.renderChild.bind(this));

                return this;
            },

            toggleChildren: function (event) {
                event.stopImmediatePropagation();
                if (this.childrenEl.hasClass('hidden')) {
                    this.$(event.target).html('-');
                    this.childrenEl.removeClass('hidden');
                } else {
                    this.$(event.target).html('+');
                    this.childrenEl.addClass('hidden');
                }
            },

            renderChild: function (child) {
                var childView = new BookTocItemView({ model: child });
                childView.render(this.hash);
                this.childrenEl.append(childView.el);
            },

            highlightItem: function (event) {
                if (event.target.hasAttribute('href')) {
                    if (event.target.getAttribute("href").split('/').pop() === window.encodeURIComponent(this.model.get("href"))) {
                        this.$el.addClass("current");
                    }
                } else {
                    // in case of the user misses the a link, we trigger it
                    this.$el.find('a')[0].click();
                }

                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.CLICK_TOC_ITEM, {
                    href: this.model.get('href'),
                    label: this.model.get('label'),
                    position: this.model.get('position'),
                    level: this.model.get('level')
                });
            },

            setCurrent: function (model, current) {
                if (current) {
                    this.$el.addClass("current");
                } else {
                    this.$el.removeClass("current");
                }
            }
        });

        return BookTocItemView;
    });