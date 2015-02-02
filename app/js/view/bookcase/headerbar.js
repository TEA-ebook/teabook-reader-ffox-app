/*global define, window*/
/*jslint stupid:true*/
define('view/bookcase/headerbar', ['backbone', 'template/bookcase/headerbar'],
    function (Backbone, template) {
        "use strict";

        var HeaderBarView = Backbone.View.extend({

            tagName: 'div',
            className: 'bar headerbar',

            events: {
                "click .search-cancel": "resetMode",
                "keyup input[type=search]": "hideKeyboard",
                "click .search-display": "searchMode"
            },

            render: function () {
                this.$el.html(template());
                this.localize();
                return this;
            },

            localize: function () {
                window.document.l10n.updateData({ "random": Math.floor(Math.random() * 4) });
                window.document.l10n.localizeNode(this.el);
            },

            searchMode: function () {
                this.localize();
                this.$el.addClass("searchbar");
                this.$el.find("input").focus();
            },

            resetMode: function (event) {
                event.stopImmediatePropagation();
                this.$el.removeClass("searchbar");
                this.$el.find("input").val("").keyup();
            },

            hideKeyboard: function (event) {
                if (event.keyCode === 13) {
                    this.$el.find("input").blur();
                }
            },

            selectionMode: function (nbSelected) {
                this.$el.find(".title").html(window.document.l10n.getSync('selectToDelete', { number: nbSelected }));
                this.$el.addClass("selection");
            },

            reset: function () {
                this.$el.find(".title").html(window.document.l10n.getSync('bookcase'));
                this.$el.removeClass("selection");
            }
        });

        return HeaderBarView;
    });