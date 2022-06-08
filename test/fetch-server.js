import {expect} from '@esm-bundle/chai';
import {FetchServer} from '../lib';

describe(`FetchServer`, function () {
  it(`stubs an API endpoint response with a static return value`, async function () {
    const fetchServer = new FetchServer(
      {
        '/foo.json': {foo: `bar`},
      },
      {debug: false},
    );
    fetchServer.start();
    const res = await fetch(`/foo.json`);
    const val = await res.json();
    expect(val).to.eql({foo: `bar`});
    fetchServer.restore();
  });
});
