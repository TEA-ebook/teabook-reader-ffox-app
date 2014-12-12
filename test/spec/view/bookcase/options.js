/*global describe, should, it, beforeEach, afterEach, curl, sinon, $, Backbone*/
(function() {
    "use strict";
    describe('Bookcase.Options view', function () {
        var sandbox;

        beforeEach(function () {
            // create a sandbox
            sandbox = sinon.sandbox.create();

            // fake db
            sandbox.stub(Backbone.Collection.prototype, "fetch", function (options) {
                if (options && options.success) {
                    options.success();
                }
            });
            sandbox.stub(Backbone.Model.prototype, "save");
        });

        afterEach(function () {
            // restore the environment as it was before
            sandbox.restore();
        });

        describe('instance', function () {
            it('should render and check "detail" input', function (done) {
                curl(['model/setting', 'collection/settings', 'view/bookcase/options'], function (SettingModel, SettingCollection, OptionsView) {
                    // Given a bookcase options view and a collection of settings
                    var optionsView, settings;
                    settings = new SettingCollection([ new SettingModel({ name: "view", value: "detail" }) ]);

                    // When the view is created and rendered
                    optionsView = new OptionsView({ collection: settings });

                    // Then 2 inputs for display mode should be proposed, and the view 'detail' input checked
                    optionsView.$el.find("input[name='display-mode']").should.have.length(2);
                    optionsView.$el.find("input#display-mode-gallery")[0].hasAttribute("checked").should.be.false;
                    optionsView.$el.find("input#display-mode-list").attr("checked").should.equal("checked");

                    done();
                });
            });

            it('should render and check "lastRead" input', function (done) {
                curl(['model/setting', 'collection/settings', 'view/bookcase/options'], function (SettingModel, SettingCollection, OptionsView) {
                    // Given a bookcase options view and a collection of settings
                    var optionsView, settings;
                    settings = new SettingCollection([ new SettingModel({ name: "sort", value: "lastRead" }) ]);

                    // When the view is created and rendered
                    optionsView = new OptionsView({ collection: settings });

                    // Then 6 inputs for display sort should be proposed, and the sort 'lastRead' input checked
                    optionsView.$el.find("input[name='display-sort']").should.have.length(6);
                    optionsView.$el.find("input#display-sort-author-asc")[0].hasAttribute("checked").should.be.false;
                    optionsView.$el.find("input#display-sort-last-read").attr("checked").should.equal("checked");

                    done();
                });
            });

            it('should compute settings', function (done) {
                curl(['model/setting', 'collection/settings', 'view/bookcase/options'], function (SettingModel, SettingCollection, OptionsView) {
                    sandbox.spy(OptionsView.prototype, "notifyReady");

                    // Given a bookcase options view and a collection of settings
                    var optionsView, settings;
                    settings = new SettingCollection([
                        new SettingModel({ name: "view", value: "cover" }),
                        new SettingModel({ name: "sort", value: "lastRead" })
                    ]);
                    settings.on("ready", function () {
                        OptionsView.prototype.notifyReady.should.have.been.calledOnce;
                        done();
                    });

                    // When the view is created and rendered
                    optionsView = new OptionsView({ collection: settings });

                    // Then 'settings' and 'options' objects should be available and a 'ready' event should be triggered
                    optionsView.settings.view.should.be.equal("cover");
                    optionsView.settings.sort.should.be.equal("lastRead");
                    optionsView.options.view.cover.should.be.true;
                    optionsView.options.sort.lastRead.should.be.true;

                });
            });
        });
    });
}());