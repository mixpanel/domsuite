# domsuite

*Work In Progress*

JavaScript browser testing/automation utilities. Uses `async/await` syntax to make
asynchronous UI interactions straightforward.

Mocha example:
```js
import {clickElement, condition, nextAnimationFrame} from 'domsuite';

describe(`my sweet UI`, function() {
  it(`renders the foo when I click the bar`, function() {
    await clickElement(document.querySelector(`.bar`));
    await nextAnimationFrame();
    expect(document.querySelector(`.bar`)).to.be.null;
    await condition(() => !!document.querySelector(`.foo`));
  });
});
```

## Development / Running tests

#### Install dependencies

`npm install`

Browser tests run with Selenium through [web-component-tester](https://github.com/Polymer/tools/tree/master/packages/web-component-tester).

#### Run with locally installed browsers
`npm test`

#### Tunnel to [Sauce Labs](https://saucelabs.com/)
`SAUCE=1 npm test`

Set credentials with environment variables `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY`. The default browser/OS matrix is defined in `wct.conf.js`.

#### Testing dev loop
- Terminal 1: Build browser test bundles, rebuild when source files change: `WATCH=true npm run test-build`
- Terminal 2: Launch browsers, keep alive after tests run: `PERSISTENT=true npm run test-run`
- Change source files, refresh browser tab to rerun tests
- Open browser dev tools to stop on breakpoints, debug, etc

## License

MIT
