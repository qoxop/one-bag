const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SystemRegisterLoader = require('./tools/loader/system-register-loader');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const NpmImportPlugin = require("less-plugin-npm-import")

const { ModuleFederationPlugin } = webpack.container;

const SystemOptions = {
  syncs: [
    'react',
    'react-dom',
    'redux',
    'react-redux',
    'react-router',
    'react-router-config',
    '@reduxjs/toolkit',
    'history',
    'qs'
  ]
}

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    'react-combo': path.resolve(__dirname, './src/index.tsx'),
  },
  output: {
    chunkFilename: "[name].[contenthash].js",
    path: path.resolve(__dirname, './dist'),
    // publicPath: 'http://localhost:5000/',
    // clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ["node_modules"],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true
          },
        }
      },
      {
        resource: path.resolve(__dirname, './src/system.register.ts'),
        use: {
          loader: SystemRegisterLoader.loaderPath,
          options: SystemOptions,
        }
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: false,
            }
          },
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                // modifyVars: theme,
                relativeUrls: true,
                paths: [
                  path.resolve(__dirname, 'node_modules'),
                ],
                plugins: [
                  new NpmImportPlugin({ prefix: '~' })
                ]
              }
            }
          },
        ]
      }
    ]
  },
  plugins: [
    new AntdDayjsWebpackPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: '[name].[fullhash].css',
    //   chunkFilename: '[id].[fullhash].css',
    //   ignoreOrder: true
    // }),
    new ModuleFederationPlugin({
      name: "react-combo",
      shared: SystemRegisterLoader.parseDeps(SystemOptions).asyncDeps,
    }),
  ],
  optimization: {
    minimize: false,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          safari10: true,
        },
      }),
     
    ]
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
    buildDependencies: {
      config: [__filename, path.resolve(__dirname, './package.json')],
    },
  },
}