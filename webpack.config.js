const path = require('path')

module.exports = (env, argv) => {
  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? false : '#source-map',
    entry: {
      '01': './example/src/01',
      '02': './example/src/02',
      '03': './example/src/03',
      '04': './example/src/04',
      '05': './example/src/05',
      '06': './example/src/06',
      '01-vanilla': './example/src/01-vanilla',
      '01-component': './example/src/01-component',
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
