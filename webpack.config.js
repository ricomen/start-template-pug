const path = require('path');
const webpack = require('webpack');

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

  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor',
    //     filename: '[name].js',
    //     minChunks: Infinity
    // }),
    // uncomment in case of emergency code formatter need
    // new PrettierPlugin({
    //     printWidth: 80,
    //     tabWidth: 4
    // }),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //     beautify: false,
    //     comments: false,
    //     compress: {
    //         sequences     : true,
    //         booleans      : true,
    //         loops         : true,
    //         unused      : true,
    //         warnings    : false,
    //         drop_console: true,
    //         unsafe      : true
    //     }
    // })
  ],
  
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