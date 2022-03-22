/* eslint-env node */

const path = require(`path`);

const webpackConfig = {
  entry: path.join(__dirname, `index.js`),
  output: {
    path: path.join(__dirname, `compiled`),
    filename: `tests.bundle.js`,
    pathinfo: true,
  },
  mode: `development`,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: `babel-loader`,
          },
        ],
      },
    ],
  },
  watch: !!process.env.WATCH,
};

module.exports = webpackConfig;
