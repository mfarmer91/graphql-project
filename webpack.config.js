const path = require('path');

module.exports = {
  entry: './js/app.js',
  //app.js is the entry point.

  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
    //then webpack generates a bundle.js file inside the 'public' directory.
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
        //this instructs webpack to use babel on files whose names end with .js -- exluding files in node_modules directory.
    ]
  }
};