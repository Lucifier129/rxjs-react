const path = require('path')

module.exports = (env, argv) => {
  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? false : '#source-map',
    entry: {
      '01': './example/src/01',
      '01-vanilla': './example/src/01-vanilla',
      todo: './example/src/todo'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'example/dist')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    resolve: {
      alias: {
        'rxjs-react': path.join(__dirname, 'src')
      }
    }
  }
}
