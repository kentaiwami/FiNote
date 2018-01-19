#!/bin/sh

sass --style expanded www/css/scss/index.css.scss:www/css/scss/index.css
cordova build ios

