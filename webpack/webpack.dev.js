const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { merge } = require('webpack-merge')
const webpackCommon = require('./webpack.common')

const appDirectory = fs.realpathSync(process.cwd());

function getPath (dir = '') {
  return path.resolve(appDirectory, dir)
}

const PATH_SRC = getPath('src/test');
const PATH_DIST = getPath('devdist');
const MATCH_NODE_MODULES = '/node_modules/';

const pkg = require(getPath('package.json'));
const projectName = pkg.projectName;

module.exports = merge(webpackCommon, {
  entry: PATH_SRC + '/selection-test.tsx',
  output: {
    filename: '[name].[fullhash].js',
    path: PATH_DIST,
    chunkFilename: '[name].[fullhash].js',
    clean: true
  },
  watchOptions: {
    //不监听的node_modules目录下的文件,
    ignored: /node_modules/
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '../devdist')
    },
    host: '0.0.0.0',
    hot: true,
    open: true,
    compress: true
  },
  mode: "development",
  devtool: 'inline-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: projectName,
      filename: 'index.html',
      template: getPath('src/test/test.html'),
    })
    // new webpack.DefinePlugin({
    //   'process.env': configFile
    // })
  ]
});
