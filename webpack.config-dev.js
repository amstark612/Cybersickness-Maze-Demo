const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const common = require('./webpack.common.js');

// App directory
const appDirectory = fs.realpathSync(process.cwd());

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',

    devServer: {
        contentBase: path.resolve(appDirectory, "public"),  // tells webpack to serve from the public folder
        publicPath: '/',
        compress: true,
        hot: true,
        open: true,
        disableHostCheck: true,
        port: 8081,  // port that we're using for local host

        // enable access from other devices on network
        useLocalIp: true,
        host: '0.0.0.0',

        // https: true // enable when HTTPS is needed (like in WebXR)

    }    
});
