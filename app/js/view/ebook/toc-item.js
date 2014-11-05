/*global define: true*/
define('view/ebook/toc-item', ['backbone', 'template/ebook/toc-item'],
    function (Backbone, template) {
        "use strict";

        var EbookTocItemView = Backbone.View.extend({

            tagName: 'li',
            className: 'ebook-toc-item',

            render: function (uri) {
                this.uri = uri;
                this.$el.html(template({
                    model: this.model.attributes,
                    uri: uri
                }));
                this.childrenEl = this.$el.find('ul');
                this.model.get("items").forEach(this.renderChild.bind(this));

                return this;
            },

            renderChild: function (child) {
                var childView = new EbookTocItemView({ model: child });
                childView.render(this.uri);
                this.childrenEl.append(childView.el);
            }
        });

        return EbookTocItemView;
    });