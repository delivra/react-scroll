var webpack = require('webpack')

module.exports = function (config) {

  config.set({

    browsers: [ 'Chrome', 'Firefox'],
    frameworks: [ 'mocha', "karma-typescript" ],
    reporters: [ 'mocha', "karma-typescript" ],

    files: [
      "modules/**/*.ts",
      "modules/**/*.tsx",
      'tests.webpack.js',
      'examples/basic/app.css'
    ],

    preprocessors: {
      "**/*.ts": "karma-typescript",
      "**/*.tsx": "karma-typescript",
      'tests.webpack.js': [ 'webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map', 
      resolve: {
        extensions: ['.js', '.ts', '.tsx'],
      },
      module: {
        rules: [
          { 
            test: /\.js$/, 
            exclude: /node_modules/, 
            loader: 'babel-loader'
          },
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ]
      }
    },

    webpackServer: {
      noInfo: true
    }

  });

}
