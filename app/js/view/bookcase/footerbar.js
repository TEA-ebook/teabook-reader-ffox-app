/*global define*/
define('view/bookcase/footerbar', ['backbone', 'view/bookcase/actionbar', 'template/bookcase/footerbar'],
    function (Backbone, ActionBarView, template) {
        "use strict";

        var FooterBarView = Backbone.View.extend({

            tagName: 'div',
            className: 'bar footerbar',

            initialize: function () {
                this.actionBar = new ActionBarView();
            },

            render: function () {
                this.$el.html(template());
                return this;
            },

            toggleDelete: function () {
                if (this.$el.find("button.remove").hasClass("selected")) {
                    return this.hideDelete();
                }
                return this.showDelete();
            },

            showDelete: function () {
                this.clear();
                this.$el.find("button.remove").addClass("selected");
                this.actionBar.render();
                this.$el.before(this.actionBar.el);
                return true;
            },

            hideDelete: function () {
                this.$el.find("button.remove").removeClass("selected");
                this.actionBar.$el.remove();
                return false;
            },

            showSort: function () {
                this.clear();
                this.$el.find("button.sort").addClass("selected");
                return true;
            },

            hideSort: function () {
                this.$el.find("button.sort").removeClass("selected");
                return false;
            },

            toggleSort: function () {
                this.$el.find("button.sort").toggleClass("selected");
            },

            clear: function () {
                this.$el.find("button").removeClass("selected");
                this.hideDelete();
                this.hideSort();
            }
        });

        return FooterBarView;
    });