import {FetchServer} from '../lib/fetch-server';

describe(`FetchServer`, function() {
  it(`supports static return values`, async function() {
    const fetchServer = new FetchServer({
      '/foo.json': `bar`,
    });
    fetchServer.start();

    const res = await fetch(`https://myserver/foo.json`);
    const val = await res.json();
    expect(val).to.equal(`bar`);
  });
});
