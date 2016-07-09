module.exports = function (config) {
    config.set({
        basePath: '.',
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        reporters: ['spec'],
        files: [
            'tests/*.js',
        ],
        preprocessors: {
            'tests/*.js': ['webpack', 'sourcemap'],
        },
        webpack: {
            devtool: 'inline-source-map',
        },
        webpackMiddleware: {
            noInfo: true,
        },
    });
};
