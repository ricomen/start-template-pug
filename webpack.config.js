const path = require('path');

const PATHS = {
  src: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build')
};

module.exports =  {
  entry: PATHS.src + '/js/app.js',
  output: {
    path: PATHS.build + /js/,
    filename: 'app.js'
  },  

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }


};