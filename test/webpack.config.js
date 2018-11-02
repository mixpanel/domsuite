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
            options: {
              presets: [
                [
                  `env`,
                  {
                    targets: {
                      browsers: [
                        `Chrome >= 60`,
                        `Firefox >= 56`,
                        `Safari >= 10.1`,
                        `last 1 ChromeAndroid version`,
                        `last 1 Edge version`,
                        `last 2 iOS versions`,
                      ],
                    },
                  },
                ],
              ],
            },
          },
        ],
      },
    ],
  },
  watch: !!process.env.WATCH,
};

module.exports = webpackConfig;
