# Install

 * Get code : `git clone --recursive git@github.com:TEA-ebook/teabook-reader-ffox-app.git`
 * Install node.js modules: `npm install`
 * Install readium node.js modules: `cd readium-js/; npm install`
 * Install gulp, bower and grunt:
  * `npm install -g gulp`
  * `npm install -g bower`
  * `npm install -g grunt`
 * Download js modules: `bower install`

# Build

 * Build readium first: `gulp readium`
 * Build app: `gulp build`

# Gulp options

 * tasks:
  * default: build app with local env, no debug and open default browser
  * build: build app with local env by default
  * debug: build app with local env, debug activated and --nobrowser
  * tests: run mocha/chai tests

 * args:
   * --debug: sources are not minified and livereload server activated
   * --env: local / demo / prod (includes ./app/conf/{env}.js)
   * --nobrowser: prevent from opening browser at the end of the build
