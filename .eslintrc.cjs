module.exports = {
  extends: [`mixpanel`],
  env: {
    node: true,
    browser: true,
  },
  rules: {
    'space-before-function-paren': `off`,
    // in some dom operation, while(true) is necessary
    'no-constant-condition': `off`,
  },
  overrides: [
    {
      files: [`test/**/*.js`],
      rules: {
        'no-unused-expressions': `off`, // for Chai assertions such as expect(x).to.be.ok
      },
      env: {
        mocha: true,
      },
    },
  ],
};
