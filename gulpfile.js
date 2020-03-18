const addsrc = require('gulp-add-src');
const concat = require('gulp-concat-util');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const size = require('gulp-size');
const terser = require('gulp-terser');
const through = require('through2');
const File = require('vinyl');

function concatTranslations(file, opt) {
  let translations = {}

  function bufferContents(file, enc, cb) {
    let locale = file.path.replace(file.base + '/', '').replace('.json', '');
    translations[locale] = JSON.parse(file.contents);
    cb();
  }

  function endStream(cb) {
    let file = new File({
      path: 'translations.js',
      contents: new Buffer(`const translations = ${JSON.stringify(translations)};\nsetLanguage(options.language);`)
    });
    this.push(file);
    cb();
  }

  return through.obj(bufferContents, endStream);
}

gulp.task('build:js', function() {
  return gulp.src(['src/kontra.js', 'src/wavesurfer.js', 'src/globals.js', 'src/ui.js', 'src/translations.js', 'src/scenes/index.js', 'src/**/*.js', '!src/main.js'])
    .pipe(addsrc.append('src/main.js'))
    .pipe(concat('index.js'))
    .pipe(gulp.dest('.'))
});

gulp.task('build:translations', function() {
  translations = {}

  return gulp.src('src/translations/*.json')
    .pipe(concatTranslations())
    .pipe(gulp.dest('src'));
})

gulp.task('dist:js', function() {
  return gulp.src('index.js')
    .pipe(concat.header('(function() {'))
    .pipe(concat.footer('})();'))
    .pipe(plumber())
    .pipe(terser())
    .pipe(plumber.stop())
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist:html', function() {
  return gulp.src('index.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true
    }))
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist:audio', function() {
  return gulp.src('AudioDashDefault.mp3')
    .pipe(size({
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series('build:translations', 'build:js'));
gulp.task('dist', gulp.parallel('dist:js', 'dist:html', 'dist:audio'));

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['build:js']);
});

gulp.task('default', gulp.series('build'));