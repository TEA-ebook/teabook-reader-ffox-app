/*global define, navigator*/
define('helper/activity-handler', ['backbone', 'helper/device'], function (Backbone, Device) {
    "use strict";

    if (navigator.mozSetMessageHandler) {
        navigator.mozSetMessageHandler('activity', function (activityRequest) {
            if (activityRequest.source.name === 'open') {
                // display waiting screen
                Backbone.history.navigate("open", true);

                // import book into bookcase
                setTimeout(function () {
                    Device.addBook(activityRequest.source.data.blob, function (book) {
                        Backbone.history.navigate("book/" + book.get('path').hashCode(), true);
                    });
                }, 50);
            }
        });
    }

    return;
});