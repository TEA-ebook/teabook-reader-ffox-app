/*global define, window, Teavents*/
/*jslint unparam: true*/
define('view/bookcase/options', ['backbone', 'model/setting', 'template/bookcase/options'],
    function (Backbone, SettingModel, template) {
        "use strict";

        var BookcaseOptionsView = Backbone.View.extend({

            tagName: 'div',
            className: 'panel bookcase-options hidden',

            events: {
                "change input[name='display-mode']": "saveDisplayMode",
                "change input[name='display-sort']": "saveDisplaySort"
            },

            initialize: function () {
                this.collection.fetch({
                    success: this.notifyReady.bind(this)
                });
            },

            render: function (data) {
                this.$el.html(template(data));
                window.document.l10n.localizeNode(this.el);
                return this;
            },

            notifyReady: function () {
                if (this.collection.isEmpty()) {
                    this.initializeSettings(this.notifyReady.bind(this));
                    return;
                }

                this.computeSettings();
                this.collection.trigger('ready');

                this.render(this.options);
            },

            computeSettings: function () {
                this.options = {};
                this.settings = {};

                this.collection.models.forEach(function (setting) {
                    this.options[setting.get('name')] = {};
                    this.options[setting.get('name')][setting.get('value')] = true;
                    this.settings[setting.get('name')] = setting.get('value');
                }.bind(this));
            },

            initializeSettings: function (callback) {
                var viewSetting, sortSetting;

                viewSetting = new SettingModel({
                    name: "view",
                    value: "cover"
                });
                viewSetting.save();

                sortSetting = new SettingModel({
                    name: "sort",
                    value: "authorAsc"
                });
                sortSetting.save();

                this.collection.reset([viewSetting, sortSetting], {
                    success: callback
                });
            },

            saveDisplayMode: function (event) {
                this.saveSetting("view", event.target.value);
            },

            saveDisplaySort: function (event) {
                this.saveSetting("sort", event.target.value);
            },

            saveSetting: function (name, value) {
                var setting = this.collection.findWhere({ "name": name });
                setting.fetch({
                    success: function (model) {
                        model.save({ "value": value }, {
                            success: this.notifyChange.bind(this)
                        });
                    }.bind(this)
                });
            },

            notifyChange: function () {
                this.computeSettings();
                this.collection.trigger('update');
                this.hide();
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    return this.show();
                }
                return this.hide();
            },

            show: function () {
                this.$el[0].classList.remove("hidden");
                Backbone.trigger(Teavents.FREEZE_BODY);
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                Backbone.trigger(Teavents.UNFREEZE_BODY);
                return false;
            }
        });

        return BookcaseOptionsView;
    });