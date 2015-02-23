# Tea Reader: an eBooks reader for Firefox OS

Tea Reader makes it very easy for everyone to read eBooks, online or offline. ANY ebook in epub format can be read (v2 & v3), and only DRM-free books are supported for now. Once you downloaded/imported an eBook, you can read it anywhere, anytime, on- or offline, with or without coffee.


## Install

  * Get the code : `git clone --recursive git@github.com:TEA-ebook/teabook-reader-ffox-app.git`
  * Install node.js modules: `npm install`
  * Install readium node.js modules: `cd readium-js/; npm install`
  * Install gulp, bower and grunt:
    * `npm install -g gulp`
    * `npm install -g bower`
    * `npm install -g grunt`
  * Download js modules: `bower install`

## How to build the app?

### Steps:
 1. Build readium: `gulp readium`
 2. Build the app: `gulp build`

### Build options
  * tasks:
    * default: build app with local env, no debug and open default browser
    * build: build app with local env by default
    * debug: build app with local env, debug activated and --nobrowser
    * tests: run mocha/chai tests
  * args:
    * --debug: sources are not minified and livereload server activated
    * --env: local / demo / prod (includes ./app/conf/{env}.js)
    * --nobrowser: prevent from opening browser at the end of the build

## Deploy and run the app


### On a Firefox OS device
  * Run the server: `node server/server.js`
  * Plug your device to your computer
  * Open WebIDE in Firefox
  * Click on `Project > Open Packaged App…`
  * Select the `dist` directory in your local copy of the github project
  * Click on `Select Runtime` (in WebIDE, top right corner) and choose your device
  * Click on the Play button

### On the Firefox OS simulator
  * Run the server: `node server/server.js`
  * Open WebIDE in Firefox
  * Click on `Select Runtime` (in WebIDE, top right corner) and choose your device
  * Click on `Install Simulator` and install the `Firefox OS 2.0 Simulator (stable)` simulator
  * Once installed, close this window
  * Select the simulator you just installed
  * Then click on `Project > Open Packaged App…`
  * Select the `dist` directory in your local copy of the github project
  * Click on the Play button

### With Chrome
  * Run the server: `node server/server.js`
  * Edit your local IP in the following file: `app/conf/local.js`
  * Run the following gulp command: `gulp --debug`
  * Open the dev tools and toggle the device mode and select the Google Nexus 4 for example
  * Refresh the page to update the app screen rendering


## How to contribute?

Please read the [Contributing guide](https://github.com/TEA-ebook/teabook-reader-ffox-app/blob/master/CONTRIBUTING.md).