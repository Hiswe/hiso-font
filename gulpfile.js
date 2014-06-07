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
// See this for categories
// http://unicode.org/Public/UNIDATA/UnicodeData.txt
var unicodeList = _.merge(
                    require('unicode/category/Po'),
                    require('unicode/category/Sm'),
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
  // console.log(path.basename);
  var name = path.basename;
  if (/^.*_(.)$/.test(name)) {
    path.basename = prependUnicode(name);
  }
  if (/^.*_[A-Za-z0-9]{4}$/.test(name)) {
    path.basename = cleanUnicode(name);
  }
  if (/^.*_p\d+-.+$/.test(name)) {
    path.basename = privateUse(name);
  }

  // console.log(path.basename);

}

function prependUnicode(name) {
  var matches = /^.*_(.)$/.exec(name);
  name = 'u' + getHexCode(matches[1]) + '-' + matches[1];
  return name
}

function cleanUnicode(name) {
  var matches = /^.*_([A-Za-z0-9]{4})$/.exec(name);
  var descriptionKey = _.findKey(unicodeList, {value: matches[1].toUpperCase()});
  if (typeof unicodeList[descriptionKey] === 'undefined') {
    console.log('no unicode for:', matches[1]);
  } else {
    name = 'u' + matches[1] + '-' + unicodeList[descriptionKey].name;
  }
  return name;
}

function privateUse(name) {
  var matches = /^.*_p\d+-(.+)$/.exec(name);
  return matches[1];
}

function getHexCode(text) {
  var code = text.charCodeAt(0);
  var codeHex = code.toString(16).toUpperCase();
  while (codeHex.length < 4) { codeHex = '0' + codeHex; }
  return codeHex
}

function isLetter(file) {
  // console.log(file.path + '');
  // if (!/_[a-z\u00E0-\u00FF\u00EF]\.svg$/i.test(file.path+'')) {
  //   console.log(file.path)
  // }
  // console.log(file.path);
  return /_[a-z]\.svg$/i.test(file.path)
}

gulp.task('unicode', function (cb) {
  ';-:.\\/<>'.split('').forEach(function(letter){
    console.log(letter, '    ', getHexCode(letter));
  });
  // console.log('\n');
  // '✉☎ℹ▨▧⛭⟵⟶✎✐✏⚒'.split('').forEach(function(letter){
  //   console.log(letter, '    ', getHexCode(letter));
  // });
  console.log('\n');
  'ï'.split('').forEach(function(letter){
    console.log(letter, '    ', getHexCode(letter));
  });
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