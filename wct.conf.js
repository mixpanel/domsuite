const {SAUCE, PERSISTENT} = process.env;

module.exports = {
  npm: true,
  verbose: false,
  expanded: true,
  persistent: !!PERSISTENT,

  suites: [`test/index.html`],

  plugins: {
    local: {
      disabled: !!SAUCE,
      browsers: [
        `chrome`,
        `firefox`,
      ],
    },
    sauce: {
      disabled: !SAUCE,
      extendedDebugging: true,
      tunnelOptions: {
        // retry establishing sauce tunnel connection every 30s for 30m
        // ...for when those pipes get clogged
        connectRetries: 60,
        connectRetryTimeout: 30000,
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
