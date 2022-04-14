const path = require('path');
const webpack = require('webpack');
const ENV = require('./env');

module.exports = (env) => ({
  mode: 'development',
  entry: [
    './src/index.ts'
  ],
  devtool: "source-map",
  
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'docs'),
  },

  resolve: {
    extensions: [ '.ts', '.js', '.scss' ],
  },

  plugins: [
    new webpack.EnvironmentPlugin(ENV),
  ],

  devServer: {
    compress: true,
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: [
      'localhost',
    ],
    historyApiFallback: {
      index: 'index.html',
    },
  },

  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        use: [
          'babel-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name(file) {
            if (process.env.NODE_ENV === 'development') {
              return path.relative(__dirname, file).replace(/^src\//, "");
            }

            return '[contenthash].[ext]';
          }
        },
      },
      {
        test: /\.(html)$/i,
        loader: 'file-loader',
        options: {
          name(file) {
            return '[name].[ext]';
          }
        },
      },
    ],
  },
});
