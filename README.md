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
