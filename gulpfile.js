/***********************************
 * Module dependencies.
 ************************************/
var gulp = require('gulp');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

/***********************************
 * initial tasks sequence
 ************************************/
/***********************************
 * build sequence related tasks
 ************************************/ 
//Code quality
gulp.task('lint', function(callback) {
  return gulp.src(['server/*.js','server/lib/*.js','server/controllers/*.js','server/views/*.js','server/boot/*.js','server/data/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//CSS compilation
gulp.task('sass', function (callback) {
  return gulp.src('./client/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))    
    .pipe(gulp.dest('./client/css'));
});

gulp.task('minify-css', function (callback) {
  return gulp.src(['./client/css/neo4jd3.css'])    
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe (sourcemaps.write('./'))
    .pipe(gulp.dest('./client/css/'));
});

gulp.task('build',
  gulp.series('lint', gulp.series(['sass', 'minify-css'])));
/*gulp.task('build', function (callback) {
  runSequence('lint','sass','minify-css', callback);
});*/


