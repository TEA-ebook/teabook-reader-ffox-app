/*global define: true, Teavents: true*/
define('view/ebook/options', ['backbone', 'template/ebook/options'],
    function (Backbone, template) {
        "use strict";

        var EbookOptionsView = Backbone.View.extend({

            tagName: 'div',
            className: 'ebook-options hidden',

            events: {
                "change input[type=range]": "updateFontSize",
                "click": "hideIfOutClick"
            },

            initialize: function () {
                Backbone.on(Teavents.MESSAGE, this.readiumEvent.bind(this));
                this.fontSize = 120;
            },

            render: function () {
                this.$el.html(template({
                    fontSize: this.fontSize
                }));
                return this;
            },

            readiumEvent: function (event) {
                if (event.data.type === 'readium') {
                    var readiumEvent = event.data.event;
                    if (readiumEvent.type === Teavents.Readium.SETTINGS_APPLIED) {
                        this.notWorking();
                        this.fontSize = readiumEvent.data.fontSize;
                        this.render();
                    }
                }
            },

            updateFontSize: function (event) {
                this.isWorking();
                setTimeout(function () {
                    Backbone.trigger(Teavents.FONTSIZE_SET, event.target.value);
                }, 100);
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    return this.show();
                }
                this.hide();
            },

            isWorking: function () {
                this.$el[0].classList.add("working");
                this.$el.find('input').attr("disabled", "");
            },

            notWorking: function () {
                this.$el[0].classList.remove("working");
                this.$el.find('input').removeAttr("disabled");
            },

            show: function () {
                this.$el[0].classList.remove("hidden");
                return true;
            },

            hide: function () {
                this.$el[0].classList.add("hidden");
                return false;
            },

            focus: function (event) {
                this.$(event.target).focus();
            },

            hideIfOutClick: function (event) {
                if (event.target.classList.contains("ebook-options")) {
                    Backbone.trigger(Teavents.OPTIONS_CLOSED);
                    this.hide();
                }
            },

            close: function () {
                Backbone.off(Teavents.MESSAGE);
                this.remove();
            }
        });

        return EbookOptionsView;
    });