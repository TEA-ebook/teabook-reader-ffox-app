/*global define*/
define("model/setting", ["backbone", "database"], function (Backbone, database) {
    "use strict";

    var SettingModel = Backbone.Model.extend({
        database: database,
        storeName: "settings"
    });

    return SettingModel;
});