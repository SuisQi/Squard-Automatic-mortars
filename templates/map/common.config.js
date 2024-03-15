const path = require('path');
const webpack = require('webpack');

module.exports = env => {
  return ({
    entry: './src/main.ts',
    // mode: 'development', // 设置默认的 mode
    plugins: [
      new webpack.DefinePlugin({
        'process.env.mode': JSON.stringify(env.NODE_ENV || 'production')
      })
    ],
    devtool: 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      filename: "app.js",
      compress: true,
      port: 8000,
      client: {
        progress: true,
      },

    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'app.js',
      path: path.resolve(__dirname, 'public'),
    },
  });}
