/*global describe, beforeEach, afterEach, should, it, curl, sinon, $, Backbone*/
(function () {
    "use strict";
    describe('Bookcase view', function () {
        var sandbox,
            bookAdetails = { title: "Dune", authors: ["Frank Herbert"], publisher: "Robert Laffont", added: 1549481661, read: 0 },
            bookBdetails = { title: "2001: a space odyssey", authors: ["Arthur C. Clarke"], publisher: "Hutchinson", added: 2565959595, read: 2566529544 },
            bookCdetails = { title: "Children of Dune", authors: ["Frank Herbert"], publisher: "Robert Laffont", added: 2565954595, read: 2661529544 },
            makeSearchEvent = function (value) { return { target: { value: value } }; };

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
                curl(['collection/books', 'model/book', 'view/bookcase/index', 'view/bookcase/options'], function (BookCollection, BookModel, BookcaseView, OptionsView) {
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
                curl(['collection/books', 'model/book', 'view/bookcase/index', 'view/bookcase/options'], function (BookCollection, BookModel, BookcaseView, OptionsView) {
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

            it('should display the drawer when menu button is pressed', function (done) {
                curl(['collection/books', 'model/book', 'view/bookcase/index', 'view/bookcase/options'], function (BookCollection, BookModel, BookcaseView, OptionsView) {
                    sandbox.stub(OptionsView.prototype, "initialize", function () {
                        this.settings = { view: "detail", sort: "lastRead" };
                    });

                    // Given a bookshelf view with an book collection
                    var bookcaseView = new BookcaseView({ collection: new BookCollection() });
                    bookcaseView.render();

                    // When we click on the menu button
                    bookcaseView.$el.find(".menu").click();
                    bookcaseView.close();

                    // The drawer should be displayed
                    bookcaseView.$el[0].classList.contains("withDrawer").should.be.true;

                    done();
                });
            });

            it('should search a book by its title', function (done) {
                curl(['collection/books', 'model/book', 'helper/device', 'view/bookcase/index', 'view/bookcase/options'],
                    function (BookCollection, BookModel, Device, BookcaseView, OptionsView) {
                        sandbox.stub(OptionsView.prototype, "initialize", function () {
                            this.settings = { view: "detail", sort: "lastRead" };
                        });

                        bookAdetails.search = Device.generateSearchString(bookAdetails);
                        bookBdetails.search = Device.generateSearchString(bookBdetails);
                        bookCdetails.search = Device.generateSearchString(bookCdetails);

                        // Given a bookshelf view with an book collection
                        var books = new BookCollection();
                        var bookcaseView = new BookcaseView({ collection: books });
                        bookcaseView.render();
                        books.add(new BookModel(bookAdetails));
                        books.add(new BookModel(bookBdetails));
                        books.add(new BookModel(bookCdetails));
                        bookcaseView.fetchBooks();

                        // When we search for 'dun'
                        bookcaseView.searchFor(makeSearchEvent("dun"));
                        bookcaseView.close();

                        // only 'Dune' and 'Children of Dune' shoud be visible
                        bookcaseView.$el.find(".book").should.have.length(2);
                        bookcaseView.$el.find(".book .book-details-title")[0].textContent.should.equals(bookCdetails.title);

                        done();
                    });
            });

            it('should search a book by its author', function (done) {
                curl(['collection/books', 'model/book', 'helper/device', 'view/bookcase/index', 'view/bookcase/options'],
                    function (BookCollection, BookModel, Device, BookcaseView, OptionsView) {
                        sandbox.stub(OptionsView.prototype, "initialize", function () {
                            this.settings = { view: "detail", sort: "lastRead" };
                        });

                        bookAdetails.search = Device.generateSearchString(bookAdetails);
                        bookBdetails.search = Device.generateSearchString(bookBdetails);

                        // Given a bookshelf view with an book collection
                        var books = new BookCollection();
                        var bookcaseView = new BookcaseView({ collection: books });
                        bookcaseView.render();
                        books.add(new BookModel(bookAdetails));
                        books.add(new BookModel(bookBdetails));
                        bookcaseView.fetchBooks();

                        // When we search for 'CLaRk'
                        bookcaseView.searchFor(makeSearchEvent("CLaRk"));
                        bookcaseView.close();

                        // only '2001: space odyssey' shoud be visible
                        bookcaseView.$el.find(".book").should.have.length(1);
                        bookcaseView.$el.find(".book .book-details-authors").text().trim().should.equals(bookBdetails.authors.join(", "));

                        done();
                    });
            });

            it('should search a book by its publisher', function (done) {
                curl(['collection/books', 'model/book', 'helper/device', 'view/bookcase/index', 'view/bookcase/options'],
                    function (BookCollection, BookModel, Device, BookcaseView, OptionsView) {
                        sandbox.stub(OptionsView.prototype, "initialize", function () {
                            this.settings = { view: "detail", sort: "lastRead" };
                        });

                        bookAdetails.search = Device.generateSearchString(bookAdetails);
                        bookBdetails.search = Device.generateSearchString(bookBdetails);
                        bookCdetails.search = Device.generateSearchString(bookCdetails);

                        // Given a bookshelf view with an book collection
                        var books = new BookCollection();
                        var bookcaseView = new BookcaseView({ collection: books });
                        bookcaseView.render();
                        books.add(new BookModel(bookAdetails));
                        books.add(new BookModel(bookBdetails));
                        books.add(new BookModel(bookCdetails));
                        bookcaseView.fetchBooks();

                        // When we search for 'son'
                        bookcaseView.searchFor(makeSearchEvent("son"));
                        bookcaseView.close();

                        // only '2001: space odyssey' shoud be visible
                        bookcaseView.$el.find(".book").should.have.length(1);
                        bookcaseView.$el.find(".book .book-details-title").text().trim().should.equals(bookBdetails.title);

                        done();
                    });
            });
        });
    });
}());