/*global define, window*/
/*jslint unparam: true*/
define('view/ebook/toc-item', ['backbone', 'template/ebook/toc-item'],
    function (Backbone, template) {
        "use strict";

        var EbookTocItemView = Backbone.View.extend({

            tagName: 'li',
            className: 'ebook-toc-item',

            initialize: function () {
                this.model.on("change:current", this.setCurrent.bind(this));
            },

            render: function (uri) {
                this.uri = uri;
                this.$el.html(template({
                    label: this.model.get('label'),
                    href: window.encodeURIComponent(this.model.get('href')),
                    level: this.model.get('level'),
                    uri: uri,
                    current: this.model.get('current')
                }));
                this.childrenEl = this.$el.find('ul');
                this.model.get("items").forEach(this.renderChild.bind(this));

                return this;
            },

            renderChild: function (child) {
                var childView = new EbookTocItemView({ model: child });
                childView.render(this.uri);
                this.childrenEl.append(childView.el);
            },

            setCurrent: function (model, current) {
                if (current) {
                    this.$el.addClass("current");
                } else {
                    this.$el.removeClass("current");
                }
            }
        });

        return EbookTocItemView;
    });