/*global define, window, Teavents*/
define('view/book/options', ['backbone', 'model/book', 'template/book/options'],
    function (Backbone, BookModel, template) {
        "use strict";

        var BookOptionsView = Backbone.View.extend({

            tagName: 'div',
            className: 'book-options hidden',

            events: {
                "change input[type=range]": "updateFontSize",
                "click button": "updateTheme",
                "click": "hideIfOutClick"
            },

            initialize: function () {
                Backbone.on(Teavents.Readium.SETTINGS_APPLIED, this.applySettings.bind(this));
                this.fontSize = BookModel.prototype.defaults.fontSize;
            },

            render: function () {
                this.$el.html(template({
                    fontSize: this.fontSize
                }));
                window.document.l10n.localizeNode(this.el);
                return this;
            },

            applySettings: function (data) {
                this.notWorking();
                this.fontSize = data.fontSize;
                this.render();
            },

            updateFontSize: function (event) {
                this.isWorking();
                setTimeout(function () {
                    Backbone.trigger(Teavents.Actions.SET_FONT_SIZE, event.target.value);
                }, 50);
            },

            updateTheme: function (event) {
                this.theme = event.target.className.match(/^(\w*)-theme$/)[1];
                Backbone.trigger(Teavents.Actions.SET_THEME, this.theme);
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
                if (event.target.classList.contains("book-options")) {
                    Backbone.trigger(Teavents.OPTIONS_CLOSED);
                    this.hide();
                }
            },

            close: function () {
                Backbone.off(Teavents.Readium.SETTINGS_APPLIED);
                this.remove();
            }
        });

        return BookOptionsView;
    });