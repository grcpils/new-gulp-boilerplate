const {src, dest, series, parallel, lastRun, watch} = require('gulp')
const sass        = require('gulp-sass')
const rename      = require('gulp-rename')
const concat      = require('gulp-concat')
const imagemin    = require('gulp-imagemin')
const cleancss    = require('gulp-clean-css')
const uglify      = require('gulp-uglify')
const browsersync = require('browser-sync').create()
const babel       = require('gulp-babel')
const del         = require('del')

let path = {
  style: {
    src: [
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'src/sass/*.scss',
      'src/sass/**/*.scss'
    ],
    dest: 'dist/asset/css/'
  },
  scripts: {
    src: [
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'src/asset/js/**/*.js'
    ],
    dest: 'dist/asset/js'
  },
  images: {
    src: ['src/asset/img/*'],
    dest: 'dist/asset/img'
  },
  fonts: {
    src: ['src/fonts/*'],
    dest: 'dist/fonts'
  }
}

function clean () {
  return del('dist')
}

function styles() {
  return src(path.style.src, {sourcemaps: true})
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('styles.css', {newLine: ''}))
    .pipe(cleancss())
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(path.style.dest, {sourcemaps: '.'}))
}

function scripts() {
  return src(path.scripts.src, {sourcemaps: true})
    .pipe(concat('scripts.js'))
    .pipe(babel({presets: ['@babel/env']}))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(dest(path.scripts.dest, {sourcemaps: '.'}))
}

function images() {
  return src(path.images.src, {since: lastRun(images)} )
    .pipe(imagemin())
    .pipe(dest(path.images.dest))
}

function fonts() {
  return src(path.fonts.src, {since: lastRun(fonts)} )
  .pipe(dest(path.fonts.dest))
}

function browserSync() {
  browsersync.init({
    watch: true,
    server: { baseDir: "./" },
    port: 3000,
    files: [path.scripts.dest, path.style.dest]
})
}

function watcher () {
  watch(path.style.src, {ignoreInitial: false}, styles)
  watch(path.scripts.src, {ignoreInitial: false}, scripts)
  watch(path.images.src, {ignoreInitial: false}, images)
  watch(path.fonts.src, {ignoreInitial: false}, fonts)
}

module.exports = {
  watch: parallel(browserSync, series(clean, images ,watcher)),
  build: series(clean, parallel(styles, scripts, images, fonts)),
  clean
}
