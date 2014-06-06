'use strict';

var es          = require('event-stream');
var gulp        = require('gulp');
var wait        = require('gulp-wait');
var clone       = require('gulp-clone');
var rename      = require('gulp-rename');
var iconfont    = require('gulp-iconfont');
var lazypipe    = require('lazypipe');
var gulpFilter  = require('gulp-filter');
var consolidate = require('gulp-consolidate');
// SERVER
var lr          = require('tiny-lr')();
var open        = require('gulp-open');
var gulpLr      = require('gulp-livereload');
var express     = require('express');
var connectLr   = require('connect-livereload');

/////////
// UTILITIES
/////////

function getHexCode(text) {
  var code = text.charCodeAt(0);
  var codeHex = code.toString(16).toUpperCase();
  while (codeHex.length < 4) { codeHex = '0' + codeHex; }
  return codeHex
}

function prependUnicode(path) {
  // get the letter
  var matches = /^.*_(.)$/.exec(path.basename)
  // You can specify which unicode you're aiming in the name
  // https://github.com/nfroidure/gulp-svgicons2svgfont/blob/master/src/index.js#L61
  // prepend the unicode
  var name = 'u' + getHexCode(matches[1]) + '-' + matches[1];
  path.basename = name;
}

function isLetter(file) {
  return /[a-z]\.svg$/.test(file.path)
}

/////////
// LAZYPIPES
/////////

var uppercaseStream = lazypipe()
  .pipe(clone)
  .pipe(gulpFilter, isLetter)
  .pipe(rename, function(path){
    path.basename = path.basename.toUpperCase();
  });

/////////
// BUILD
/////////

function onCodePoints(dst, options) {
  // Generate css file
  gulp.src('src/template.css')
    .pipe(consolidate('lodash', {fontName: options.fontName, fontPath: './'}))
    .pipe(rename(function nameCssFile(path) {
      path.basename = options.fontName + '-font';
    }))
    .pipe(gulp.dest(dst))
}

gulp.task('build', function(){
  var src = gulp.src('src/dark/*.svg')
  // Generate the uppercase files
  var maj = src
    .pipe(uppercaseStream())

  // Generate the font
  es.merge(src, maj)
    .pipe(rename(prependUnicode))
    .pipe(
      iconfont({
        fontName: 'hiso-dark', // required
        appendCodepoints: false // recommended option to true
      })
      .on('codepoints', function(codepoints, options) { onCodePoints('dst/dark', options) }))
    .pipe(gulp.dest('dst/dark'))
});

/////////
// SERVER
/////////

// SERVER
var startExpress = function startExpress() {
  var app = express();
  app.use(connectLr());
  app.use(express.static(__dirname));
  app.listen(3000);
};

gulp.task('express', function(cb){
  startExpress();
  lr.listen(35729);
  cb();
});

gulp.task('server', ['express'], function(){
  gulp.src('./README.md').pipe(wait(1000)).pipe(open('', {url: "http://localhost:3000"}));
});



/////////
// DOC
/////////