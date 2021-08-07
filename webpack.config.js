const path = require('path');
const webpack = require('webpack');
const { version, config } = require('./package.json');
const TerserPlugin = require('terser-webpack-plugin');
const NpmImportPlugin = require("less-plugin-npm-import");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const SystemRegisterLoader = require('./helper/loaders/system-register-loader');
const SummaryPlugin = require('./helper/plugins/webpack-summary.plugin');

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
  ],
  ignores: ['systemjs', 'antd', 'whatwg-fetch']
}

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    'one-bag': path.resolve(__dirname, './src/index.tsx'),
  },
  output: {
    filename: `[name]@${version}.js`,
    chunkFilename: "[name].[contenthash].js",
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ["node_modules"],
    symlinks: false,
    alias: {
      'src': path.resolve(__dirname, './src'),
    }
  },
  module: {
    noParse: function (content) {
      return /system\.min\.js$/.test(content);
    },
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
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: false,
            }
          },
          'postcss-loader'
        ]
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
    new MiniCssExtractPlugin({
      filename: `[name]@${version}.css`,
      chunkFilename: '[id].css',
      ignoreOrder: true
    }),
    new ModuleFederationPlugin({
      name: "one-bag",
      shared: SystemRegisterLoader.parseDeps(SystemOptions).asyncDeps,
    }),
    new SummaryPlugin({cdn: config.cdn, version })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          safari10: true,
        },
      }),
    ],
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: false,
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    }
  },
  // cache: {
  //   type: 'filesystem',
  //   allowCollectingMemory: true,
  //   buildDependencies: {
  //     config: [__filename, path.resolve(__dirname, './package.json')],
  //   },
  // },
}
