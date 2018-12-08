const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const livereload = require('gulp-livereload');
const babel = require("gulp-babel");
const handlebars = require('gulp-handlebars');
const declare = require('gulp-declare');
const wrap = require('gulp-wrap');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const del = require('del');
const zip = require('gulp-zip');

const DIST_PATH = 'public/dist';
const SCRIPTS_PATH = 'assets/scripts/**/*.js';
const CSS_PATH = 'assets/css/**/*.css';
const SCSS_PATH = 'assets/scss/styles.scss';
const TEMPLATES_PATH = 'templates/**/*.hbs';
const IMAGES_PATH = 'assets/images/**/*.{png,jpeg,jpg,svg,gif}';

gulp.task('styles', () => {
  console.log('====================================');
  console.log('styles');
  console.log('====================================');
  return compileCSS(CSS_PATH, 'dist.css');
});

gulp.task('sass', () => {
  console.log('====================================');
  console.log('sass');
  console.log('====================================');
  return compileSCSS(SCSS_PATH, 'dist.css');
});

gulp.task('scripts', () => {
  console.log('====================================');
  console.log('scripts');
  console.log('====================================');

  return compileJS(SCRIPTS_PATH, 'dist.js');
});

gulp.task('images', () => {
  console.log('====================================');
  console.log('images');
  console.log('====================================');
  return gulp.src(IMAGES_PATH)
            .pipe(imagemin(
              [
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                imageminPngquant(),
                imageminJpegRecompress()
              ]
            ))
            .pipe(gulp.dest(DIST_PATH + '/images'));
});

const compileJS = (PATH, DIST) => {
  return gulp.src(PATH)
            .pipe(sourcemaps.init())
            .pipe(babel({
              presets: ['@babel/env']
            }))
            .pipe(uglify())
            .pipe(concat(DIST))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(DIST_PATH))
            .pipe(livereload());
}

const compileCSS = (PATH, DIST) => {
  return gulp.src(['public/css/reset.css', PATH])
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(cleanCSS({compatibility: 'ie8'}))
            .pipe(concat(DIST))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(DIST_PATH))
            .pipe(livereload());
}

const compileSCSS = (PATH, DIST) => {
  return gulp.src(PATH)
            .pipe(sourcemaps.init())
            .pipe(
              sass({
                outputStyle: 'compressed',
                sourceMap: true
              }).on('error', sass.logError)
            )
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }))
            .pipe(concat(DIST))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(DIST_PATH))
            .pipe(livereload());
}

const compileTemplate = (PATH, DIST) => {
  return gulp.src(PATH)
            .pipe(handlebars())
            .pipe(wrap('Handlebars.template(<%= contents %>)'))
            .pipe(declare({
              namespace: 'templates',
              noRedeclare: true
            }))
            .pipe(concat(DIST))
            .pipe(gulp.dest(DIST_PATH))
            .pipe(livereload());
}

gulp.task('templates', function () {
  console.log('====================================');
  console.log('templates');
  console.log('====================================');
  return compileTemplate(TEMPLATES_PATH, 'templates.js');    
});

gulp.task('clean', function (cb) {
	del([
    DIST_PATH,
    'website.zip'
	]).then(() => {
    cb();
  });
});

gulp.task('backup', gulp.series('clean', function(cb) {
  return gulp.src(['**/*.*', '!node_modules/**/*.*'])
            .pipe(zip('website.zip'))
            .pipe(gulp.dest('./'));
}));

// gulp.task('watch', () => {
//   compileJS(SCRIPTS_PATH, 'dist.js');
//   compileSCSS(SCSS_PATH, 'dist.css');
//   compileTemplate(TEMPLATES_PATH, 'templates.js');
// 	console.log('Starting watch task');
// 	require('./server.js');
// 	livereload.listen();
// 	gulp.watch(SCRIPTS_PATH, gulp.series('scripts'));
// 	gulp.watch('public/css/**/*.scss', gulp.series('sass'));
// 	gulp.watch(TEMPLATES_PATH, gulp.series('templates'));
// });

// gulp.watch(SCRIPTS_PATH, ['scripts']);

gulp.task('default', gulp.series( 'clean', 'sass', 'scripts', 'images', 'templates' ));

gulp.task('watch', gulp.series( 'default', () => {
	console.log('Starting watch task');
	require('./server.js');
	livereload.listen();
	gulp.watch(SCRIPTS_PATH, gulp.series('scripts'));
	gulp.watch(SCSS_PATH, gulp.series('sass'));
	gulp.watch(TEMPLATES_PATH, gulp.series('templates'));
}));