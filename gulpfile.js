'use strict';

var
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    htmlmin = require('gulp-htmlmin'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence');

gulp.task('lint', function() {
    return gulp.src(['./client_src/js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js', function() {
    return gulp.src([
            './bower_components/jquery/dist/jquery.min.js',
            './bower_components/underscore/underscore-min.js',
            './bower_components/backbone/backbone.js',
            './client_src/js/*.js'
        ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('css', function() {
    gulp.src([
            './client_src/css/*.css'
        ])
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./build'));
});

gulp.task('html', function() {
    return gulp.src('./client_src/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('clean', function() {

    return gulp.src('./build').pipe(clean());
});

gulp.task('build', function(cb) {
    runSequence(
        'lint',
        'clean',
        ['js', 'html', 'css'],
        cb
    );
});

gulp.task('default', ['build']);
