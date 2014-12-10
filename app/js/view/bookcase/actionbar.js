/*global define*/
define('view/bookcase/actionbar', ['backbone', 'template/bookcase/actionbar'],
    function (Backbone, template) {
        "use strict";

        var ActionBarView = Backbone.View.extend({

            tagName: 'div',
            className: 'bar actionbar',

            render: function () {
                this.$el.html(template());
                return this;
            }
        });

        return ActionBarView;
    });