import isEmpty from 'lodash/isEmpty';
import platform from 'platform';

export {FetchServer} from './fetch-server';


//region Non-async getters

export function queryShadowSelectorsAll(rootEl, selectors) {
  if (!rootEl) {
    return [];
  }

  let currEl = rootEl;
  let elements = [];
  selectors.some((selector, idx) => {
    currEl = currEl.shadowRoot;
    if (!currEl) {
      return true;
    }

    if (idx !== selectors.length - 1) {
      currEl = currEl.querySelector(selector);
    } else {
      elements = Array.from(currEl.querySelectorAll(selector));
    }
  });

  return elements;
}

export function queryShadowSelectors(rootEl, selectors) {
  const el = queryShadowSelectorsAll(rootEl, selectors);
  return !isEmpty(el) ? el[0] : null;
}

export function getActiveElement() {
  let activeEl = document.activeElement;
  while (activeEl && activeEl.shadowRoot) {
    activeEl = activeEl.shadowRoot.activeElement;
  }
  return activeEl;
}

export function isVisibleElement(el) {
  // Based on http://stackoverflow.com/a/21696585
  return !!(el && el.offsetParent);
}

// Based on https://stackoverflow.com/a/10730777
export function getDescendantTextParts(el) {
  const textParts = [];
  const treeWalker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  let currNode = treeWalker.nextNode();
  while (currNode) {
    textParts.push(currNode.textContent);
    currNode = treeWalker.nextNode();
  }
  return textParts;
}

//endregion

//region Async actions

// How long to sleep after an action (e.g. click element, type input)
let defaultWaitMsAfterAction = 50;
export function setDefaultWaitMsAfterAction(waitMs) {
  defaultWaitMsAfterAction = waitMs;
}

export async function nextAnimationFrame() {
  return new Promise(requestAnimationFrame);
}

export async function sleep(durationMs) {
  return new Promise(resolve => setTimeout(resolve, durationMs));
}

export async function sleepAfterAction() {
  await sleep(defaultWaitMsAfterAction);
}

export async function retryable(retryableFunc, {maxWaitMs=1000}={}) {
  const startTimestamp = (new Date()).getTime();
  do {
    let error = null;
    try {
      return await retryableFunc();
    } catch (e) {
      error = e;
    }

    const elapsedTime = (new Date()).getTime() - startTimestamp;
    if (elapsedTime > maxWaitMs) {
      throw new Error(
        `Retryable did not complete in allocated time:\n${error.stack}\n\n` +
        `Failing function:\n${retryableFunc.toString()}\n`
      );
    }
    await sleep(25);
  } while (true); // eslint-disable-line
}

export async function condition(predicate, {maxWaitMs=1000}={}) {
  const startTimestamp = (new Date()).getTime();
  while (true) { // eslint-disable-line
    let error = null;
    try {
      const val = await predicate();
      if (val) {
        return val;
      }
    } catch (e) {
      error = e;
    }

    const elapsedTime = (new Date()).getTime() - startTimestamp;
    if (elapsedTime > maxWaitMs) {
      throw new Error(
        `Condition was not met in allocated time:\n${error && error.stack}\n\n` +
        `Failing function:\n${predicate.toString()}\n`);
    }
    await sleep(25);
  }
}


export async function mouseenterElement(el, {waitMs=defaultWaitMsAfterAction}={}) {
  el.dispatchEvent(new MouseEvent(`mouseenter`, {
    composed: true,
  }));
  await sleep(waitMs);
}

export async function mousedownElement(el, {waitMs=defaultWaitMsAfterAction}={}) {
  el.dispatchEvent(new MouseEvent(`mousedown`, {
    bubbles: true,
    composed: true,
  }));
  await sleep(waitMs);
}

export async function clickElement(el, {waitMs=defaultWaitMsAfterAction}={}) {
  el.click();
  await sleep(waitMs);
}

export async function changeInput(inputEl, value, {waitMs=defaultWaitMsAfterAction}={}) {
  inputEl.value = value;
  inputEl.dispatchEvent(new Event(`change`, {
    bubbles: true,
    composed: true,
  }));
  await sleep(waitMs);
}

export async function sendInput(inputEl, value, {waitMs=defaultWaitMsAfterAction}={}) {
  inputEl.value = value;
  inputEl.dispatchEvent(new Event(`input`, {
    bubbles: true,
    // composed: true is needed to mimic real 'input' event which will cross shadow-dom boundary
    composed: true,
  }));
  await sleep(waitMs);
}

export async function sendInputToActiveElement(value, {waitMs=defaultWaitMsAfterAction}={}) {
  await sendInput(getActiveElement(), value, {waitMs});
}

// Browser names defined here: https://github.com/lancedikson/bowser/blob/master/test/acceptance/useragentstrings.yml
export const BROWSERS = {
  CHROME: `Chrome`,
  FIREFOX: `Firefox`,
  SAFARI: `Safari`,
  EDGE: `Microsoft Edge`,
};

export function isBrowser(browserName) {
  return platform.name === browserName;
}

//endregion
