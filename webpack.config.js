const path = require("path");
const webpack = require("webpack");

module.exports = {
  context: path.resolve(__dirname, "./"),
  entry: {
    app: path.resolve("scripts/script.js"),
    backgroundSync: path.resolve("scripts/backgroundSync.js"),
    styles: path.resolve("css/app.css"),
    serviceWorker: path.resolve("serviceWorker.js")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
            options: { presets: ["es2015"] }
          }
        ]
      },
      {
          test: /\.css$/,
          exclude: [/node_modules/],
          use: [
              'style-loader',
              'css-loader'
          ]
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].bundle.js"
  }
};