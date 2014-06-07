'use strict';

var _           = require('lodash');
var es          = require('event-stream');
var gulp        = require('gulp');
var wait        = require('gulp-wait');
var clone       = require('gulp-clone');
var rename      = require('gulp-rename');
var iconfont    = require('gulp-iconfont');
var lazypipe    = require('lazypipe');
var gulpFilter  = require('gulp-filter');
var unorm       = require('unorm');
// See this for categories
// http://unicode.org/Public/UNIDATA/UnicodeData.txt
var unicodeList = _.merge(
                    require('unicode/category/Po'),
                    require('unicode/category/Nd'),
                    require('unicode/category/Sm'),
                    require('unicode/category/Lu'),
                    require('unicode/category/So'),
                    require('unicode/category/Pd'),
                    require('unicode/category/Ll')
                  );
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

// You can specify which unicode you're aiming in the name
// with this format u0031-name.svg
// https://github.com/nfroidure/gulp-svgicons2svgfont/blob/master/src/index.js#L61
function cleanName(path) {
  var name = unorm.nfc(path.basename);
  // console.log(name);
  if (/^.*_(.)$/.test(name)) {
    path.basename = prependUnicode(name);
  }
  if (/^.*_[A-Za-z0-9]{4}$/.test(name)) {
    path.basename = cleanUnicode(name);
  }
  if (/^.*_p\d+-.+$/.test(name)) {
    path.basename = privateUse(name);
  }
}

function prependUnicode(name) {
  var matches = /^.*_(.)$/.exec(name);
  var hexCode = getHexCode(matches[1]);
  name = 'u' + hexCode + '-' + findUnicodeName(hexCode);
  return name
}

function cleanUnicode(name) {
  var matches = /^.*_([A-Za-z0-9]{4})$/.exec(name);
  name = 'u' + matches[1] + '-' + findUnicodeName(matches[1]);
  return name;
}

function privateUse(name) {
  var matches = /^.*_p\d+-(.+)$/.exec(name);
  return 'HISWE ' + matches[1].toUpperCase();
}

function getHexCode(text) {
  var code = text.charCodeAt(0);
  var codeHex = code.toString(16).toUpperCase();
  while (codeHex.length < 4) { codeHex = '0' + codeHex; }
  return codeHex
}

function findUnicodeName(unicode) {
  var descriptionKey = _.findKey(unicodeList, {value: unicode.toUpperCase()});
  if (typeof unicodeList[descriptionKey] === 'undefined') {
    console.log('no unicode for:', unicode);
  }
  return unicodeList[descriptionKey].name
}

function isLetter(file) {
  var fileName = /([^\/]*)\.svg$/.exec(file.path)[1]
  // Has to normalize name as in ES5 ï.length could be 2 (i¨)
  // More on this in:
  // http://mathiasbynens.be/notes/javascript-unicode
  fileName = unorm.nfc(fileName);
  return /_[a-zï]$/i.test(fileName)
}

gulp.task('unicode', function (cb) {
  ';-:.\\/<>'.split('').forEach(function(letter){
    console.log(letter, '    ', getHexCode(letter));
  });
  // console.log('\n');
  // '✉☎ℹ▨▧⛭⟵⟶✎✐✏⚒'.split('').forEach(function(letter){
  //   console.log(letter, '    ', getHexCode(letter));
  // });
  cb();
})

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
  var maj = src.pipe(uppercaseStream())
  // Generate the font
  es.merge(src, maj)
    .pipe(rename(cleanName))
    .pipe(
      iconfont({
        fontName: 'hiso-dark'// required
        // , descent: 5000
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