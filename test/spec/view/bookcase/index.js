/*global describe, beforeEach, afterEach, should, it, curl, sinon, $, Backbone*/
(function() {
    "use strict";
    describe('Bookcase view', function () {
        var sandbox,
            bookAdetails = { title: "Dune", added: 1549481661, read: 0 },
            bookBdetails = { title: "2001 : a space odyssey", added: 2565959595, read: 2566529544 };

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
            it('should render itself', function (done) {
                curl(['collection/books', 'model/book', 'collection/settings', 'model/setting', 'view/bookcase/index', 'view/bookcase/options'],
                    function (BookCollection, BookModel, SettingCollection, SettingModel, BookcaseView, OptionsView) {
                        sandbox.stub(OptionsView.prototype, "initialize", function () {
                            this.settings = { view: "cover", sort: "titleAsc" };
                        });

                        // Given a bookcase view with an empty book collection and the settings
                        var bookcaseView = new BookcaseView({ collection: new BookCollection() });

                        // When the settings are loaded
                        bookcaseView.render();
                        bookcaseView.close();

                        // The view should be rendered
                        bookcaseView.$el.find(".books").should.have.length(1);

                        done();
                    }
                );
            });

            it('should render books with cover display', function (done) {
                curl(['collection/books', 'model/book', 'view/bookcase/index',  'view/bookcase/options'], function (BookCollection, BookModel, BookcaseView, OptionsView) {
                    sandbox.stub(OptionsView.prototype, "initialize", function () {
                        this.settings = { view: "cover", sort: "titleAsc" };
                    });

                    // Given a bookshelf view with an book collection
                    var books = new BookCollection();
                    var bookcaseView = new BookcaseView({ collection: books });
                    bookcaseView.render();

                    // When we add 2 books to the collection
                    books.add(new BookModel(bookAdetails));
                    books.add(new BookModel(bookBdetails));
                    bookcaseView.fetchBooks();
                    bookcaseView.close();

                    // 2 books should be visible
                    bookcaseView.$el.find(".books.cover").should.have.length(1);
                    bookcaseView.$el.find(".book").should.have.length(2);

                    done();
                });
            });

            it('should render books with details display', function (done) {
                curl(['collection/books', 'model/book', 'view/bookcase/index',  'view/bookcase/options'], function (BookCollection, BookModel, BookcaseView, OptionsView) {
                    sandbox.stub(OptionsView.prototype, "initialize", function () {
                        this.settings = { view: "detail", sort: "lastRead" };
                    });

                    // Given a bookshelf view with an book collection
                    var books = new BookCollection();
                    var bookcaseView = new BookcaseView({ collection: books });
                    bookcaseView.render();

                    // When we add 2 books to the collection
                    books.add(new BookModel(bookAdetails));
                    books.add(new BookModel(bookBdetails));
                    bookcaseView.fetchBooks();
                    bookcaseView.close();

                    // 2 books should be visible
                    bookcaseView.$el.find(".books.detail").should.have.length(1);
                    bookcaseView.$el.find(".book").should.have.length(2);

                    done();
                });
            });
        });
    });
}());