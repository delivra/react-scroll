/*
 * Tell the browser that the event listener won't prevent a scroll.
 * Allowing the browser to continue scrolling without having to
 * to wait for the listener to return.
 */
export const addPassiveEventListener = (target: HTMLElement | Document, eventName: string, listener: EventListenerOrEventListenerObject) => {
  const supportsPassiveOption = (() => {
    let supportsPassiveOption = false;
    try {
      let opts = Object.defineProperty({}, 'passive', {
        get: () => {
          supportsPassiveOption = true;
        }
      });

      //This is dirty
      (window as any).addEventListener('test', null, opts);
    } catch (e) { }
    return supportsPassiveOption;
  })();
  target.addEventListener(eventName, listener, supportsPassiveOption ? { passive: true } : false);
};

export const removePassiveEventListener = (target: HTMLElement, eventName: string, listener: EventListenerOrEventListenerObject) => {
  target.removeEventListener(eventName, listener);
}

