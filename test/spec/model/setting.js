/*global describe: true, should: true, it: true, curl: true, Backbone: true */
(function() {
    "use strict";
    describe('Setting model', function () {
        describe('instance', function () {
            it('should be an instance of Backbone.Model', function (done) {
                curl(['model/setting'], function (SettingModel) {
                    var setting = new SettingModel();
                    setting.should.be.an.instanceof(Backbone.Model);
                    done();
                });
            });
        });
    });
}());