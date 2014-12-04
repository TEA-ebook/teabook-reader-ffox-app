/*global define, window*/
define('view/book/toc', ['backbone', 'view/book/toc-item', 'template/book/toc'],
    function (Backbone, TocItemView, template) {
        "use strict";

        var BookTocView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-toc hidden',

            initialize: function (options) {
                this.hash = options.hash;
            },

            render: function () {
                this.$el.html(template());
                window.document.l10n.localizeNode(this.el);
                this.itemsEl = this.$el.find('ul');
                this.model.get("items").forEach(this.renderItem.bind(this));
                return this;
            },

            renderItem: function (item) {
                var tocItemView = new TocItemView({ model: item });
                tocItemView.render(this.hash);
                this.itemsEl.append(tocItemView.el);
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    return this.show();
                }
                return this.hide();
            },

            show: function () {
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                return false;
            }
        });

        return BookTocView;
    });