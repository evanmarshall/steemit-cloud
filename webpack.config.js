const path = require('path');

module.exports = {
    entry: {
        'index': './src/steemit-stats.js'
    },
    output: { 
        path: __dirname + '/build/js',
        filename: './[name].js',
        publicPath: __dirname + '/build'
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [
            { test: /\.js$/, loader: 'source-map-loader', enforce: 'pre' },
            { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/,
                query: {
                    plugins: ['transform-runtime'],
                    presets: ['es2015']
                }
            }
        ]
    },
    externals: {
        steem: 'steem',
        'chart.js': 'Chart'
    }
}