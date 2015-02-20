/*global define, window*/
define('view/bookcase/downloading-books', ['backbone', 'template/bookcase/downloading-books'],
    function (Backbone, template) {
        "use strict";

        var DownloadingBooksView = Backbone.View.extend({

            className: "downloading-books",

            render: function (numberOfFiles, downloaded, imported) {
                this.numberOfFiles = numberOfFiles;
                this.downloaded = downloaded || 0;
                this.imported = imported || 0;

                this.$el.html(template({
                    total: this.numberOfFiles,
                    downloaded: this.downloaded,
                    imported: this.imported
                }));

                window.document.l10n.updateData({
                    total: this.numberOfFiles,
                    downloaded: this.downloaded,
                    imported: this.imported
                });
                window.document.l10n.localizeNode(this.el);
            },

            updateDownloaded: function (downloaded) {
                this.downloaded = downloaded;
                this.render(this.numberOfFiles, this.downloaded, this.imported);
            },

            updateImported: function (imported) {
                this.imported = imported;
                this.render(this.numberOfFiles, this.downloaded, this.imported);
            }
        });

        return DownloadingBooksView;
    });