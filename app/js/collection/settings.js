/*global define*/
define("collection/settings", ["backbone", "database", "model/setting"], function (Backbone, database, SettingModel) {
    "use strict";

    var SettingCollection = Backbone.Collection.extend({

        model: SettingModel,

        database: database,
        storeName: "settings"

    });

    return SettingCollection;
});