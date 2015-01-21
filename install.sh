#!/bin/sh

npm install
cd readium-js/
npm install
cd ..

npm install -g gulp
npm install -g bower
npm install -g grunt

bower install

gulp readium
gulp --debug