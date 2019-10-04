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
  constructor(handlers, {debug = false} = {}) {
    this.handlers = handlers;
    this.debug = debug;
    this.handle = this.handle.bind(this);
    this.debugLog = this.debugLog.bind(this);
  }

  handle(url, params) {
    for (const [route, handler] of Object.entries(this.handlers)) {

      if (url.includes(route)) {
        if (params && params.body) {
          params = JSON.parse(params.body);
        }
        let response = isFunction(handler) ? handler(url, params) : handler;

        // Not yet promise-like
        if (!response.then) {
          // serializable value, wrap in fetch-like Promise
          const responseOptions = {
            status: 200,
            headers: {
              'Content-Type': `application/json`,
            },
          };
          response = Promise.resolve(new Response(JSON.stringify(response), responseOptions));
        }

        this.debugLog({url, params, response});
        return response;
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

  debugLog({url, params, response}) {
    if (this.debug) {
      const responseObjectPromise = response.then(r => r.clone());
      const responseBodyPromise = responseObjectPromise.then(clonedResponse => clonedResponse.json());
      Promise.all([responseObjectPromise, responseBodyPromise]).then(([response, responseBody]) => {
        console.log(`[fetch-server] ${url}`, {params}, `\n`, {response, responseBody})
      })
    }
  }
}
