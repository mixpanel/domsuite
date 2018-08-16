import isFunction from 'lodash/isFunction';
import * as sinon from 'sinon';

/**
 * Utility class to stub fetch requests with sinon. Instantiate with a set of
 * route handlers mapping URL (sub)strings to canned response values, or functions
 * which return canned responses/response values. Values will be serialized as JSON
 * and returned in a Fetch-like Promise object.
 *
 * @example
 * const fetchServer = new FetchServer({
 *   '/foo.json': 'bar',
 *   '/baz/quux': (url, params) => !!params.foo ? 'a' : 'z',
 * });
 * fetchServer.start();
 * const res = await fetch('https://myserver/foo.json');
 * const val = await res.json(); // 'bar'
 */
export class FetchServer {
  constructor(handlers) {
    this.handlers = handlers;
    this.handle = this.handle.bind(this);
  }

  handle(url, params) {
    for (const [route, handler] of Object.entries(this.handlers)) {
      if (url.includes(route)) {
        if (params && params.body) {
          params = JSON.parse(params.body);
        }
        const response = isFunction(handler) ? handler(url, params) : handler;
        if (response.then) {

          // Promise-like, return as-is
          return response;

        } else {

          // serializable value, wrap in fetch-like Promise
          const responseOptions = {
            status: 200,
            headers: {
              'Content-Type': `application/json`,
            },
          };
          return Promise.resolve(new Response(JSON.stringify(response), responseOptions));

        }
      }
    }
    throw new Error(`Unexpected fetch: ${url} params: ${JSON.stringify(params)}`);
  }

  start() {
    if (window.fetch.hasOwnProperty(`restore`)) {
      window.fetch.restore();
    }
    sinon.stub(window, `fetch`).callsFake(this.handle);
  }
}
