var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var args = require('yargs').argv;
var path = require('path');
var map = require('map-stream');
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var pngcrush = require('imagemin-pngcrush');

var debug = args.debug ? true : false;

var paths = {
    less: ['./app/less/*.less'],
    js: [
        './app/js/model/*.js',
        './app/js/collection/*.js',
        './app/js/view/*.js',
        './app/js/router.js',
        './app/js/app.js'
    ],
    images: ['./app/images/*'],
    html: ['./app/*.html'],
    manifest: ['./app/manifest.*'],
    templates: ['./app/template/*.hbs'],
    readium: './readium-js',
    readiumEmbedded: './readium-js/out/Readium.embedded.js',
    dist: {
        css: './dist/css/',
        lib: './dist/lib/',
        js: './dist/js/',
        images: './dist/images/',
        html: './dist/'
    },
    vendor: {
        js: [
            './app/vendor/jquery/dist/jquery.js',
            './app/vendor/underscore/underscore.js',
            './app/vendor/handlebars/handlebars.amd.js',
            './app/vendor/backbone/backbone.js'
        ],
        curl: [
            './app/vendor/curl/src/curl.js',
            './app/config.js'
        ]
    },
    test: ['./js/tests/**.js']
};

gulp.task('clean', function (cb) {
    del(['dist'], cb);
});

gulp.task('clean-readium', function (cb) {
    del([paths.readium + "/out"], cb);
});

gulp.task('connect', function () {
    plugins.connect.server({
        root: 'dist',
        livereload: true
    });
});

gulp.task('styles', function () {
    gulp.src(paths.less)
        .pipe(plugins.less())
        .pipe(gulpif(!debug, plugins.cssmin()))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(plugins.connect.reload());
});

gulp.task('scripts', function () {
    gulp.src(paths.js)
        .pipe(plugins.concat('app.js'))
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(plugins.connect.reload());
});

gulp.task('images', function () {
    gulp.src(paths.images)
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

gulp.task('templates', function() {
    gulp.src(paths.templates)
        .pipe(plugins.handlebars())
        .pipe(plugins.wrapper({
            header: 'Handlebars.default.template(',
            footer: ')'
        }))
        .pipe(map(function(file, cb) {
            cb(null, file);
        }))
        .pipe(plugins.wrapper({
            header: function(file) { return 'define("template/' + path.basename(file.path, path.extname(file.path)) + '", ["handlebars"], function(Handlebars) {\nreturn '; },
            footer: '; });\n'
        }))
        .pipe(plugins.concat('templates.js'))
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.js));
});

gulp.task('vendor', function () {
    gulp.src(paths.vendor.js)
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.lib))
        .pipe(plugins.connect.reload());
});

gulp.task('curl', function () {
    gulp.src(paths.vendor.curl)
        .pipe(plugins.concat('curl.js'))
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.lib))
        .pipe(plugins.connect.reload());
});

gulp.task('readium-copy', function () {
    gulp.src(paths.readiumEmbedded)
        .pipe(gulpif(!debug, plugins.uglify()))
        .pipe(gulp.dest(paths.dist.lib));
});

gulp.task('manifest', function () {
    gulp.src(paths.manifest)
        .pipe(gulp.dest(paths.dist.html))
        .pipe(plugins.connect.reload());
});

gulp.task('html', function () {
    gulp.src(paths.html)
        .pipe(plugins.preprocess({ context: { DEBUG: debug.toString() } }))
        .pipe(gulpif(!debug, plugins.htmlmin({ collapseWhitespace: true })))
        .pipe(gulp.dest(paths.dist.html))
        .pipe(plugins.connect.reload());
});

gulp.task("firefox", function () {
    gulp.src(paths.html)
        .pipe(plugins.open("", { app: "firefox", url: "http://localhost:8080/" }));
});

gulp.task('build', ['styles', 'scripts', 'images', 'templates', 'curl', 'vendor', 'readium-copy', 'manifest', 'html']);

gulp.task('watch', ['build'], function () {
    if (debug) {
        gulp.watch(paths.less, ['styles']);
        gulp.watch(paths.js, ['scripts']);
        gulp.watch(paths.images, ['images']);
        gulp.watch(paths.templates, ['templates']);
        gulp.watch(paths.vendor.curl, ['curl']);
        gulp.watch(paths.manifest, ['manifest']);
        gulp.watch(paths.html, ['html']);
    }
});

gulp.task('readium', ['clean-readium'], function () {
    plugins.grunt(gulp, {
        base: path.join(__dirname, paths.readium),
        prefix: 'readium-'
    });
    gulp.run("readium-embedded");
});

gulp.task('default', function () {
    runSequence('clean', 'connect', 'watch', 'firefox');
});