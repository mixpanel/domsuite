import { expect } from "@esm-bundle/chai";
import { FetchServer } from "../esm/index.mjs";

describe(`FetchServer`, () => {
  it(`runs this test`, async () => {
    const fetchServer = new FetchServer(
      {
        "/foo.json": { foo: `bar` },
      },
      { debug: false }
    );
    fetchServer.start();
    const res = await fetch(`/foo.json`);
    const val = await res.json();
    expect(val).to.eql({ foo: `bar` });
    fetchServer.restore();
  });
});
