module.exports = {
  extends: [`mixpanel`],
  rules: {
    'space-before-function-paren': `off`,
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
