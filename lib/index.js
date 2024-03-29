import {detect} from 'detect-browser';
import {isEmpty} from 'lodash-unified';

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
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

export async function sleepAfterAction(waitMs = defaultWaitMsAfterAction) {
  // most test action functions use await sleepAfterAction()
  // sleep for at-least one animation frame so any pending renders can complete
  await nextAnimationFrame();
  await sleep(waitMs);
}

export async function retryable(retryableFunc, {maxWaitMs = 1000} = {}) {
  const startTimestamp = new Date().getTime();
  do {
    let error = null;
    try {
      return await retryableFunc();
    } catch (e) {
      error = e;
    }

    const elapsedTime = new Date().getTime() - startTimestamp;
    if (elapsedTime > maxWaitMs) {
      const errorMessage =
        `Retryable did not complete in allocated time:\n${error.stack}\n\n` +
        `Failing function:\n${retryableFunc.toString()}\n`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    await sleep(25);
    // eslint-disable-next-line no-constant-condition
  } while (true);
}

export async function condition(predicate, {maxWaitMs = 1000} = {}) {
  const startTimestamp = new Date().getTime();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let error = null;
    try {
      const val = await predicate();
      if (val) {
        return val;
      }
    } catch (e) {
      error = e;
    }

    const elapsedTime = new Date().getTime() - startTimestamp;
    if (elapsedTime > maxWaitMs) {
      const errorMessage =
        `Condition was not met in allocated time:\n${error && error.stack}\n\n` +
        `Failing function:\n${predicate.toString()}\n`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    await sleep(25);
  }
}

export async function mouseenterElement(el, {waitMs = defaultWaitMsAfterAction} = {}) {
  el.dispatchEvent(
    new MouseEvent(`mouseenter`, {
      composed: true,
    }),
  );
  await sleepAfterAction(waitMs);
}

export async function mouseleaveElement(el, {waitMs = defaultWaitMsAfterAction} = {}) {
  el.dispatchEvent(
    new MouseEvent(`mouseleave`, {
      composed: true,
    }),
  );
  await sleepAfterAction(waitMs);
}

export async function mousedownElement(el, {waitMs = defaultWaitMsAfterAction} = {}) {
  el.dispatchEvent(
    new MouseEvent(`mousedown`, {
      bubbles: true,
      composed: true,
    }),
  );
  await sleepAfterAction(waitMs);
}

export async function clickElement(el, {waitMs = defaultWaitMsAfterAction, ...mouseEventAttrs} = {}) {
  el.dispatchEvent(new MouseEvent(`click`, {bubbles: true, ...mouseEventAttrs}));
  await sleepAfterAction(waitMs);
}

export async function changeInput(inputEl, value, {waitMs = defaultWaitMsAfterAction} = {}) {
  inputEl.value = value;
  inputEl.dispatchEvent(
    new Event(`change`, {
      bubbles: true,
      composed: true,
    }),
  );
  await sleepAfterAction(waitMs);
}

export async function sendInput(inputEl, value, {waitMs = defaultWaitMsAfterAction} = {}) {
  inputEl.value = value;
  inputEl.dispatchEvent(
    new Event(`input`, {
      bubbles: true,
      // composed: true is needed to mimic real 'input' event which will cross shadow-dom boundary
      composed: true,
    }),
  );
  await sleepAfterAction(waitMs);
}

export async function sendInputToActiveElement(value, {waitMs = defaultWaitMsAfterAction} = {}) {
  await sendInput(getActiveElement(), value, {waitMs});
}

export const BROWSERS = {
  CHROME: `chrome`,
  FIREFOX: `firefox`,
  SAFARI: `safari`,
  EDGE: `edge`,
};

export function isBrowser(browserName) {
  const browser = detect();
  return browser.name === browserName;
}

//endregion
