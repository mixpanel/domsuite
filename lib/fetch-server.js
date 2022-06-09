import * as sinon from 'sinon';
import {isFunction} from 'lodash-unified';


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
 * }, {debug: true});
 * fetchServer.start();
 * const res = await fetch('https://myserver/foo.json');
 * const val = await res.json(); // 'bar'
 */
export class FetchServer {
  /**
   * Create a FetchServer instance.
   *
   * @param {object} handlers : map of urls to response objects (or functions)
   * @param {object} [options={}]
   * @param {boolean} [options.debug=false] : output debug logging to console
   * @param {function|null} [options.errorCallback=null] : custom error handler
   *
   * errorCallback param allows hooking test framework error handling utils
   * into FetchServer so that tests may be reliably failed on error.
   */
  constructor(handlers, {debug = false, errorCallback = null, sort = false} = {}) {
    this.handlers = handlers;
    this.debug = debug;
    this.errorCallback = errorCallback;
    this.sort = sort;
  }

  handle(url, params) {
    // Order routes by url length (descending).
    // This ensures that when route overlap occurs (e.g. /foo/bar and /foo/bar/baz)
    // the more-specific route (/foo/bar/baz) is checked first. Otherwise, some
    // routes will be silently ignored when more-generic (shorter) routes exist.
    const routes = Object.entries(this.handlers);
    if (this.sort) {
      routes.sort(([aRoute], [bRoute]) => {
        // If route lengths are the same, sort alphabetically;
        // otherwise, sort by route string length (descending).
        // Route length + alpha makes sort fully deterministic.
        if (bRoute.length === aRoute.length) {
          return bRoute.toLowerCase() < aRoute.toLowerCase() ? 1 : -1;
        } else {
          return bRoute.length - aRoute.length;
        }
      });
    }

    for (const [route, handler] of routes) {
      if (url.includes(route)) {
        if (params && params.body) {
          // Allow string or JSON params.body; if valid JSON,
          // parse body to JS object before passing to handler function.
          try {
            params = JSON.parse(params.body);
          } catch (err) {
            params = params.body;
          }
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

  /**
   * Start the FetchServer, sinon.stub'ing `fetch` with a fake version.
   */
  start() {
    const fakeFetch = (url, params) => {
      try {
        return this.handle(url, params);
      } catch (err) {
        // errorCallback allows hooking test framework error handling utils
        // into FetchServer so that tests may be reliably failed on error:
        isFunction(this.errorCallback) && this.errorCallback(err);
        throw err; // rethrow error
      }
    };

    this.restore(); // clean up prior FetchServer stubs (if necessary)

    // stub fetch in browser environment:
    if (typeof window !== `undefined` && window.fetch && !Object.hasOwnProperty.call(window.fetch, `restore`)) {
      sinon.stub(window, `fetch`).callsFake(fakeFetch);
    }
    // stub fetch in NodeJS environment:
    if (typeof global !== `undefined` && global.fetch && !Object.hasOwnProperty.call(global.fetch, `restore`)) {
      sinon.stub(global, `fetch`).callsFake(fakeFetch);
    }
  }

  /**
   * Restore sinon.stub'ed `fetch` to its original state.
   */
  static restore() {
    // restore fetch in browser environment:
    if (typeof window !== `undefined` && window.fetch && Object.hasOwnProperty.call(window.fetch, `restore`)) {
      window.fetch.restore();
    }
    // restore fetch in NodeJS environment:
    if (typeof global !== `undefined` && global.fetch && Object.hasOwnProperty.call(global.fetch, `restore`)) {
      global.fetch.restore();
    }
  }

  /**
   * Restore sinon.stub'ed `fetch` to its original state.
   * (convenience method for calling from class instance)
   */
  restore() {
    FetchServer.restore();
  }

  debugLog({url, params, response}) {
    if (this.debug) {
      const responseObjectPromise = response.then((r) => r.clone());
      const responseBodyPromise = responseObjectPromise.then((clonedResponse) => clonedResponse.json());
      Promise.all([responseObjectPromise, responseBodyPromise]).then(([response, responseBody]) => {
        /* eslint-disable no-console */
        console.groupCollapsed(`[fetch-server] ${url}`);
        console.groupCollapsed(`Params`);
        console.log(JSON.stringify(params, null, 2));
        console.groupEnd();
        console.groupCollapsed(`Response`);
        console.log(JSON.stringify(response, null, 2));
        console.groupEnd();
        console.group(`Response Body`);
        console.log(JSON.stringify(responseBody, null, 2));
        console.groupEnd();
        console.groupEnd();
        /* eslint-enable no-console */
      });
    }
  }
}
