/*global define*/
define('view/bookcase/headerbar', ['backbone', 'template/bookcase/headerbar'],
    function (Backbone, template) {
        "use strict";

        var HeaderBarView = Backbone.View.extend({

            tagName: 'div',
            className: 'toolbar',

            render: function () {
                this.$el.html(template());
                return this;
            }
        });

        return HeaderBarView;
    });