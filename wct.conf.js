const {LOCAL, PERSISTENT} = process.env;

module.exports = {
  npm: true,
  verbose: false,
  expanded: true,
  persistent: !!PERSISTENT,

  suites: [`test/index.html`],

  plugins: {
    local: {
      disabled: !LOCAL,
      browsers: [
        `chrome`,
        `firefox`,
      ],
    },
    sauce: {
      disabled: !!LOCAL,
      extendedDebugging: true,
      tunnelOptions: {
        connectRetries: 5,
      },
      browsers: [
        {
          browserName: `chrome`,
          version: `latest`,
          platform: `OS X 10.13`,
        },
        {
          browserName: `firefox`,
          version: `latest`,
          platform: `OS X 10.13`,
        },
        {
          browserName: `safari`,
          version: `latest`,
          platform: `OS X 10.13`,
        },
        {
          browserName: `microsoftedge`,
          version: `latest`,
          platform: `Windows 10`,
        },
      ],
    },
  },
};
