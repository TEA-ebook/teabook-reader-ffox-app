/*global define*/
define('view/bookcase/footerbar', ['backbone', 'template/bookcase/footerbar'],
    function (Backbone, template) {
        "use strict";

        var FooterBarView = Backbone.View.extend({

            tagName: 'div',
            className: 'footerbar',

            render: function () {
                this.$el.html(template());
                return this;
            }
        });

        return FooterBarView;
    });