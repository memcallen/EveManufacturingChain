const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [
    './src/index.ts'
  ],
  devtool: "source-map",
  
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: [ '*', '.tsx', '.ts', '.js' ],
  },

  plugins: [  
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false
    }),
    // new HtmlWebpackPlugin()
  ],

  devServer: {
    // contentBase: path.join(__dirname, 'dist'),
    compress: true,
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: [
      'web.final.com',
      'localhost',
      '127.0.0.1'
    ],
    historyApiFallback: {
      index: 'index.html'
    }
  },

  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?)$/,
        use: [
          'babel-loader',
          // 'ts-loader',
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
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
};
