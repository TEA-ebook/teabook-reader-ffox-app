/*global define, window*/
/*jslint stupid:true*/
define('view/bookcase/notification', ['backbone'],
    function (Backbone) {
        "use strict";

        var NotificationView = Backbone.View.extend({

            tagName: 'div',
            className: 'notification alert',

            render: function (message) {
                this.$el.html(message);
                return this;
            }
        });

        return NotificationView;
    });