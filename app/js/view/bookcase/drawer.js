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
                "click .tea": "openTea",
                "touchmove": "noSlide"
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

            /**
             * Store user's preference in localStorage
             *
             * @param event
             */
            saveSendUsageReportsState: function (event) {
                window.localStorage.setItem(Teavents.SEND_USAGE_REPORTS, event.target.checked);
                Backbone.trigger(Teavents.SEND_USAGE_REPORTS);
            },

            /**
             * Informations about product licenses
             */
            openLicenses: function () {
                this.openBrowser("http://reader.tea-ebook.com/licenses");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_LICENSES);
            },

            /**
             * Informations on usage data collection
             */
            openUsageReports: function () {
                this.openBrowser("http://reader.tea-ebook.com/usage-reports");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_USAGE_REPORTS);
            },

            /**
             * Informations about us
             */
            openTea: function () {
                this.openBrowser("http://www.tea-ebook.com");
                Backbone.trigger(Teavents.Actions.LOG, Teavents.Events.OPEN_TEA);
            },

            /**
             * In firefox OS, we call a web activity to open a URL
             *
             * @param url
             */
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
            },

            /**
             * Prevent user from closing the drawer
             * by simply sliding it after the CSS transform
             *
             * @param event
             */
            noSlide: function (event) {
                event.preventDefault();
            }
        });

        return DrawerView;
    });