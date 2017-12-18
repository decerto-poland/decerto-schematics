var wallabyWebpack = require('wallaby-webpack');
var path = require('path');

var compilerOptions = Object.assign(
    require('./tsconfig.json').compilerOptions,
    require('./<%= sourceDir %>/tsconfig.spec.json').compilerOptions);

module.exports = function (wallaby) {

    var webpackPostprocessor = wallabyWebpack({
        entryPatterns: [
            '<%= sourceDir %>/wallabyTest.js',
            '<%= sourceDir %>/**/*spec.js'
        ],

        module: {
            loaders: [
                {test: /\.css$/, loader: ['raw-loader', 'css-loader']},
                {test: /\.html$/, loader: 'raw-loader'},
                {
                    test: /\.ts$/,
                    loader: '@ngtools/webpack',
                    include: /node_modules/,
                    query: {tsConfigPath: 'tsconfig.json'}
                },
                {test: /\.js$/, loader: 'angular2-template-loader', exclude: /node_modules/},
                {test: /\.json$/, loader: 'json-loader'},
                {test: /\.styl$/, loaders: ['raw-loader', 'stylus-loader']},
                {test: /\.less$/, loaders: ['raw-loader', 'less-loader']},
                {test: /\.scss$|\.sass$/, loaders: ['raw-loader', 'sass-loader']},
                {test: /\.(jpg|png)$/, loader: 'url-loader?limit=128000'}
            ]
        },

        resolve: {
            extensions: ['.js', '.ts'],
            modules: [
                path.join(wallaby.projectCacheDir, '<%= sourceDir %>/app'),
                path.join(wallaby.projectCacheDir, '<%= sourceDir %>'),
                'node_modules'
            ]
        },
        node: {
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            dns: 'empty'
        }
    });

    return {
        files: [
            {pattern: '<%= sourceDir %>/**/*.+(ts|css|less|scss|sass|styl|html|json|svg)', load: false},
            {pattern: '<%= sourceDir %>/**/*.d.ts', ignore: true},
            {pattern: '<%= sourceDir %>/**/*spec.ts', ignore: true}
        ],

        tests: [
            {pattern: '<%= sourceDir %>/**/*spec.ts', load: false}
        ],

        testFramework: 'jasmine',

        compilers: {
            '**/*.ts': wallaby.compilers.typeScript(compilerOptions)
        },

        middleware: function (app, express) {
            var path = require('path');
            app.use('/favicon.ico', express.static(path.join(__dirname, '<%= sourceDir %>/favicon.ico')));
            app.use('/assets', express.static(path.join(__dirname, '<%= sourceDir %>/assets')));
        },

        env: {
            kind: 'chrome'
        },

        postprocessor: webpackPostprocessor,

        setup: function () {
            window.__moduleBundler.loadTests();
        },

        hints: {
            ignoreCoverage: /istanbul ignore next: /
        },

        debug: true
    };
};
