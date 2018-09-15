const addsrc = require('gulp-add-src');
const babel = require('gulp-babel');
const concat = require('gulp-concat-util');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const size = require('gulp-size');
const terser = require('gulp-terser');
// const through = require('through2');
// const Vinyl = require('vinyl');

// let translations = {}
// function createTranslations() {
//   function bufferContents(file, enc, cb) {
//     translations[file.basename.replace('.json')] = JSON.parse(file.contents);
//     cb();
//   }

//   function endStream(cb) {
//     cb();
//   }

//   return through.obj(bufferContents, endStream);
// }

gulp.task('build:js', function() {
  return gulp.src(['src/kontra.js', 'src/wavesurfer.js', 'src/globals.js', 'src/ui.js', 'src/translations.js', 'src/*.js', '!src/main.js'])
    .pipe(addsrc.append('src/main.js'))
    .pipe(concat('index.js'))
    .pipe(gulp.dest('.'))
});

gulp.task('build:translations', function() {
  translations = {}

  // return gulp.src('translations/*.json')
})

gulp.task('build', ['build:js']);

gulp.task('dist:js', function() {
  return gulp.src('index.js')
    .pipe(rename('dist.js'))
    .pipe(concat.header('(function() {'))
    .pipe(concat.footer('})();'))
    .pipe(plumber())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(size({
      gzip: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist:html', function() {
  return gulp.src('index.html')
    .pipe(htmlmin())
    .pipe(size({
      gzip: true
    }))
    .pipe('dist');
});

gulp.task('dist:audio', function() {
  return gulp.src('AudioDashDefault.mp3')
    .pipe('dist');
});

gulp.task('dist', ['dist:js', 'dist:html', 'dist:audio']);

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['build:js']);
});

gulp.task('default', ['build:js']);