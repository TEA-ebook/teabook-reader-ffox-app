/*global define: true, window: true*/
define('view/ebook/toc', ['backbone', 'view/ebook/toc-item', 'template/ebook/toc'],
    function (Backbone, TocItemView, template) {
        "use strict";

        var EbookTocView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-toc hidden',

            initialize: function (options) {
                this.uri = options.uri;
            },

            render: function () {
                this.$el.html(template());
                this.itemsEl = this.$el.find('ul');
                this.model.get("items").forEach(this.renderItem.bind(this));
                return this;
            },

            renderItem: function (item) {
                var tocItemView = new TocItemView({ model: item });
                tocItemView.render(window.encodeURIComponent(this.uri));
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

        return EbookTocView;
    });