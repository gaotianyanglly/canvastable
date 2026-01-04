module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.scss', '.css']
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              api: 'legacy',
              sassOptions: {
                silenceDeprecations: ['legacy-js-api']
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {loader: 'babel-loader'}
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]'
        }
      },
      {
        test: /\.(mov|mp4)$/,
        type: 'asset/resource',
        generator: {
          filename: 'videos/[name].[hash][ext]'
        }
      }
    ]
  }
};
