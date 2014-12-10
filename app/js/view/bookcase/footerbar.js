/*global define*/
define('view/bookcase/footerbar', ['backbone', 'template/bookcase/footerbar'],
    function (Backbone, template) {
        "use strict";

        var FooterBarView = Backbone.View.extend({

            tagName: 'div',
            className: 'bar footerbar',

            render: function () {
                this.$el.html(template());
                return this;
            },

            toggleDelete: function () {
                this.$el.find("button.remove").toggleClass("selected");
            }
        });

        return FooterBarView;
    });