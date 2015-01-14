/*global define, window, Teavents*/
/*jslint unparam: true*/
define('view/bookcase/drawer', ['backbone', 'template/bookcase/drawer'],
    function (Backbone, template) {
        "use strict";

        var DrawerView = Backbone.View.extend({

            className: "drawer",

            events: {
                "click .sendUsageReports": "toggleSendUsageReportsInput",
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
                this.openBrowser("http://reader.tea-ebook.com/licenses");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_LICENSES);
            },

            openUsageReports: function () {
                this.openBrowser("http://reader.tea-ebook.com/usage-reports");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_USAGE_REPORTS);
            },

            openTea: function () {
                this.openBrowser("http://www.tea-ebook.com");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_TEA);
            },

            openBrowser: function (url) {
                if (window.hasOwnProperty('MozActivity')) {
                    this.browserActivity = new window.MozActivity({
                        name: "view",
                        data: {
                            type: "url",
                            url: url
                        }
                    });
                } else {
                    window.open(url);
                }
            }
        });

        return DrawerView;
    });