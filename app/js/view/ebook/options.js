/*global define: true*/
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

            render: function () {
                this.$el.html(template({
                    fontSize: 120
                }));
                return this;
            },

            updateFontSize: function (event) {
                Backbone.trigger("font-size:set", event.target.value);
            },

            toggle: function () {
                if (this.$el[0].classList.contains("hidden")) {
                    return this.show();
                }
                this.hide();
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
                    Backbone.trigger("options:closed");
                    this.hide();
                }
            }
        });

        return EbookOptionsView;
    });