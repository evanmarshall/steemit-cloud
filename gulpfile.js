// Dependencies
var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');

// Configurations
var webpackConfig = require('./webpack.config');

var getWebpackCallback = function(cb) {
    return function(err, stats) {
        if (err)
            throw new gutil.PluginError("webpack", err);
        
        gutil.log("[webpack]", stats.toString({
            chunks: false, // Makes the build much quieter
            colors: true
        }));

        if (cb) {
            if (stats.hasErrors() || stats.hasWarnings())
                cb('webpack failed');
            else 
                cb();
        }
    }
}

gulp.task('compile', function(cb) {
    return webpack(webpackConfig).run(getWebpackCallback(cb));
});


gulp.task('watch', function () {
    webpack(webpackConfig).watch({}, getWebpackCallback());
});