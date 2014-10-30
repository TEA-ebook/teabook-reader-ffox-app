var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var args = require('yargs').argv;
var path = require('path');
var map = require('map-stream');
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var pngcrush = require('imagemin-pngcrush');
var amd = require('amd-optimize');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

var debug = args.debug ? true : false;

var paths = {
    less: [
        './app/vendor/font-awesome/less/font-awesome.less',
        './app/less/*.less'
    ],
    fonts: ['./app/vendor/font-awesome/fonts/*'],
    js: ['./app/js/**/*.js'],
    images: ['./app/images/*'],
    html: ['./app/*.html'],
    manifest: ['./app/manifest.*'],
    epubs: ['./epubs/*'],
    templates: ['./app/template/**/*.hbs'],
    readium: './readium-js',
    readiumEmbedded: [
        './app/vendor/requirejs/require.js',
        './readium-js/out/Readium.embedded.js',
        './app/js/helper/gestures.js'
    ],
    dist: {
        css: './dist/css/',
        fonts: './dist/fonts/',
        js: './dist/js/',
        templates: './app/js/template/',
        images: './dist/images/',
        html: './dist/',
        epubs: './dist/books/'
    },
    curl: [
        './app/polyfill/*.js',
        './app/vendor/curl/src/curl.js'
    ],
    test: {
        runner: './test/index.html',
        specs: './test/spec/**/*.js',
        sinon: {
            source: './test/sinon-server-1.10.3.js',
            dest: './test/vendor/sinon/lib'
        },
        dist: {
            images: './test/images/'
        }
    }
};


/****************** *****************/
/************ WEB SERVER ************/
/****************** *****************/

gulp.task('web-server', function () {
    return plugins.connect.server({
        root: 'dist',
        livereload: true
    });
});


/***************** *****************/
/************** CLEAN **************/
/***************** *****************/

gulp.task('clean', function (cb) {
    del(['./dist'], cb);
});

gulp.task('clean-templates', function (cb) {
    del([paths.dist.templates], cb);
});

gulp.task('clean-readium', function (cb) {
    del([paths.readium + "/out"], cb);
});



/***************** *****************/
/************** BUILD **************/
/***************** *****************/

gulp.task('compile-less', function () {
    return gulp.src(paths.less)
        .pipe(plugins.less())
        .pipe(gulpif(!debug, plugins.cssmin()))
        .pipe(plugins.concat('main.css'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(plugins.connect.reload());
});

gulp.task('copy-fonts', function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest(paths.dist.fonts));
});

gulp.task('process-styles', ['compile-less'], function () {
    return gulp.src(paths.dist.css + "main.css")
        .pipe(plugins.uncss({
            html: ['./app/index.html']
        }))
        .pipe(gulp.dest(paths.dist.css));
});

gulp.task('process-images', function () {
    return gulp.src(paths.images)
        .pipe(plugins.imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false}
            ],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest(paths.dist.images))
        .pipe(plugins.connect.reload());
});

gulp.task('compile-curl', function () {
    return gulp.src(paths.curl)
        .pipe(plugins.concat('curl.js'))
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(plugins.connect.reload());
});

gulp.task('compile-templates', ['clean-templates'], function() {
    return gulp.src(paths.templates)
        .pipe(plugins.handlebars())
        .pipe(plugins.wrapper({
            header: function(file) { var templateName = file.path.match(/template\/([\w\/]*)/); return 'define("template/' + templateName[1] + '", ["handlebars"], function(Handlebars) {\nreturn Handlebars.default.template('; },
            footer: '); });\n'
        }))
        .pipe(plugins.rename(function (path) {
            path.extname = ".js";
        }))
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.templates));
});

gulp.task('compile-scripts', ['compile-templates'], function() {
    return gulp.src(paths.js)
        // Traces all modules and outputs them in the correct order.
        .pipe(amd("app", {
            baseUrl: "app/js",
            paths: {
                "backbone": "../vendor/backbone/backbone",
                "jquery": "../vendor/jquery/dist/jquery",
                "underscore": "../vendor/underscore/underscore",
                "handlebars": "../vendor/handlebars/handlebars.amd",
                "spin": "../vendor/spin.js/spin"
            }
        }))
        .pipe(plugins.concat("app.js"))
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(plugins.connect.reload());
});

gulp.task('copy-readium', function () {
    return gulp.src(paths.readiumEmbedded)
        .pipe(plugins.concat("readium.js"))
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.js));
});

gulp.task('copy-manifest', function () {
    return gulp.src(paths.manifest)
        .pipe(gulp.dest(paths.dist.html))
        .pipe(plugins.connect.reload());
});

gulp.task('copy-epubs', function () {
    if(debug) {
        return gulp.src(paths.epubs)
            .pipe(gulp.dest(paths.dist.epubs));
    }
});

gulp.task('process-html', function () {
    return gulp.src(paths.html)
        .pipe(plugins.preprocess({ context: { DEBUG: debug.toString() } }))
        .pipe(gulpif(!debug, plugins.htmlmin({ collapseWhitespace: true })))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(plugins.connect.reload());
});

gulp.task("open-browser", function () {
    return gulp.src(paths.html)
        .pipe(plugins.open("", { url: "http://localhost:8080/" }));
});

gulp.task('build', ['process-images', 'process-html', 'copy-fonts', 'copy-manifest', 'copy-epubs', 'copy-readium', 'compile-less', 'compile-curl', 'compile-scripts']);

gulp.task('watch-codebase', ['build'], function () {
    if (debug) {
        gulp.watch(paths.less, ['compile-less']);
        gulp.watch(paths.templates, ['compile-scripts']);
        gulp.watch(paths.js, ['compile-scripts', 'tests']);
        gulp.watch(paths.test.specs, ['tests']);
        gulp.watch(paths.images, ['process-images']);
        gulp.watch(paths.manifest, ['copy-manifest']);
        gulp.watch(paths.html, ['copy-html']);
    }
});

gulp.task('default', function () {
    runSequence('clean', 'check-code', 'web-server', 'watch-codebase', 'open-browser');
});



/******************* *****************/
/************** READIUM **************/
/******************* *****************/

gulp.task('readium', ['clean-readium'], function () {
    plugins.grunt(gulp, {
        base: path.join(__dirname, paths.readium),
        prefix: 'readium-'
    });
    gulp.run("readium-embedded");
});



/******************* *****************/
/************ CODE QUALITY ***********/
/******************* *****************/

gulp.task('jslint', function() {
    return gulp.src(paths.js)
        .pipe(plugins.ignore.exclude(/template\/.*/))
        .pipe(plugins.jslint({
            node: true
        }));
});

gulp.task('check-code', ['jslint']);



/******************* *****************/
/************* UNIT TESTS ************/
/******************* *****************/

gulp.task('tests', ['copy-sinon-server', 'compile-templates', 'compile-curl', 'copy-test-resources'], function() {
    return gulp
        .src(paths.test.runner)
        .pipe(mochaPhantomJS());
});

gulp.task('copy-sinon-server', function() {
    return gulp
        .src(paths.test.sinon.source)
        .pipe(gulp.dest(paths.test.sinon.dest));
});

gulp.task('copy-test-resources', function() {
    return gulp
        .src(paths.images)
        .pipe(gulp.dest(paths.test.dist.images));
});