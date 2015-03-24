/*global define, window, Teavents*/
/*jslint unparam: true*/
define('view/bookcase/options', ['backbone', 'model/setting', 'template/bookcase/options'],
    function (Backbone, SettingModel, template) {
        "use strict";

        var BookcaseOptionsView = Backbone.View.extend({

            tagName: 'div',
            className: 'panel bookcase-options hidden',

            events: {
                "click li": "clickRadio",
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
                this.collection.off('reset');
                if (this.collection.isEmpty()) {
                    this.collection.on('reset', this.notifyReady.bind(this));
                    this.initializeSettings();
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
                    value: "lastRead"
                });
                sortSetting.save();

                this.collection.reset([viewSetting, sortSetting], {
                    success: callback
                });
            },

            saveDisplayMode: function (event) {
                this.saveSetting("view", event.target.value);
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.CHANGE_SETTING_VIEW, { view: event.target.value });
            },

            saveDisplaySort: function (event) {
                this.saveSetting("sort", event.target.value);
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.CHANGE_SETTING_ORDER, { view: event.target.value });
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
                Backbone.trigger(Teavents.FREEZE_BODY);
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                Backbone.trigger(Teavents.UNFREEZE_BODY);
                return false;
            },

            clickRadio: function (event) {
                if (event.target.tagName.toLowerCase() === 'li') {
                    this.$(event.target).find("input").click();
                }
            }
        });

        return BookcaseOptionsView;
    });