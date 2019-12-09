const path = require('path')

module.exports = {
  entry: "./index.js",
  output: {
    path: __dirname,
    filename: "index.min.js"
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' }
      ]
    }]
  }
}