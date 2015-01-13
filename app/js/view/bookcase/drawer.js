/*global define, window, Teavents*/
define('view/bookcase/drawer', ['backbone', 'template/bookcase/drawer'],
    function (Backbone, template) {
        "use strict";

        var DrawerView = Backbone.View.extend({

            className: "drawer",

            events: {
                "click .sendStatistics": "toggleSendUsageReportsInput",
                "click input": "saveSendUsageReportsState",
                "click .whyUsageReports": "openUsageReports",
                "click .licenses": "openLicenses",
                "click .tea": "openTea"
            },

            render: function () {
                this.$el.html(template({
                    sendUsageReports: window.localStorage.getItem(Teavents.SEND_USAGE_REPORTS) === "true"
                }));
                window.document.l10n.localizeNode(this.el);
            },

            toggleSendUsageReportsInput: function (event) {
                if (event.target.tagName.toLowerCase() !== "label") {
                    var input = this.$("input#sendUsageReports");
                    input.click();
                }
            },

            saveSendUsageReportsState: function (event) {
                window.localStorage.setItem(Teavents.SEND_USAGE_REPORTS, event.target.checked);
                Backbone.trigger(Teavents.SEND_USAGE_REPORTS);
            },

            openLicenses: function () {
                window.open("http://reader.tea-ebook.com/licenses");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_LICENSES);
            },

            openUsageReports: function () {
                window.open("http://reader.tea-ebook.com/usage-reports");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_USAGE_REPORTS);
            },

            openTea: function () {
                window.open("http://www.tea-ebook.com");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_TEA);
            }
        });

        return DrawerView;
    });