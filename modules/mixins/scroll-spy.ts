import { throttle } from "lodash";
import { addPassiveEventListener } from './passive-event-listeners';
import { isDocument } from "./utils";

// The eventHandler will execute at a rate of 15fps by default
const eventThrottler = (eventHandler: () => void, throttleAmount = 66)  => throttle(eventHandler, throttleAmount);

type SpyCallback = (x: number, y: number) => void;

type SpyCallbackContainer = {
  spyCallbacks: SpyCallback[],
};

const scrollSpy = {
  spySetState: [] as (() => void)[],
  scrollSpyContainers: [] as (HTMLElement | Document)[],

  mount(scrollSpyContainer: HTMLElement | Document, throttle?: number) {
    if (scrollSpyContainer) {
      const eventHandler = eventThrottler(() => {
        scrollSpy.scrollHandler(scrollSpyContainer);
      }, throttle);
      scrollSpy.scrollSpyContainers.push(scrollSpyContainer);
      addPassiveEventListener(scrollSpyContainer, 'scroll', eventHandler);
    }
  },

  isMounted(scrollSpyContainer: HTMLElement | Document) {
    return scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer) !== -1;
  },

  currentPositionX(scrollSpyContainer: HTMLElement | Document) {
    if (isDocument(scrollSpyContainer)) {
      let supportPageOffset = window.pageYOffset !== undefined;
      let isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
      return supportPageOffset ? window.pageXOffset : isCSS1Compat ?
          document.documentElement.scrollLeft : document.body.scrollLeft;
    } else {
      return scrollSpyContainer.scrollLeft;
    }
  },

  currentPositionY(scrollSpyContainer: HTMLElement | Document) {
    if (isDocument(scrollSpyContainer)) {
      let supportPageOffset = window.pageXOffset !== undefined;
      let isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
      return supportPageOffset ? window.pageYOffset : isCSS1Compat ?
      document.documentElement.scrollTop : document.body.scrollTop;
    } else {
      return scrollSpyContainer.scrollTop;
    }
  },

  scrollHandler(scrollSpyContainer: HTMLElement | Document) {
    const container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];
    let callbacks = (container as unknown as SpyCallbackContainer).spyCallbacks || [];
    callbacks.forEach(c => c(scrollSpy.currentPositionX(scrollSpyContainer), scrollSpy.currentPositionY(scrollSpyContainer)));
  },

  addStateHandler(handler: () => void) {
    scrollSpy.spySetState.push(handler);
  },

  addSpyHandler(handler: SpyCallback, scrollSpyContainer: HTMLElement | Document) {
    let container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];

    const spyCallbackContainer = container as unknown as SpyCallbackContainer
    if(!spyCallbackContainer.spyCallbacks) {
      spyCallbackContainer.spyCallbacks = [];
    }

    spyCallbackContainer.spyCallbacks.push(handler);

    handler(scrollSpy.currentPositionX(scrollSpyContainer), scrollSpy.currentPositionY(scrollSpyContainer));
  },

  updateStates() {
    scrollSpy.spySetState.forEach(s => s());
  },

  unmount(stateHandler: undefined | (() => void), spyHandler: SpyCallback) {
    scrollSpy.scrollSpyContainers.forEach(container => {
      const c = container as unknown as SpyCallbackContainer;
      c.spyCallbacks && c.spyCallbacks.length && c.spyCallbacks.splice(c.spyCallbacks.indexOf(spyHandler), 1)
    });

    if (stateHandler && scrollSpy.spySetState && scrollSpy.spySetState.length) {
      scrollSpy.spySetState.splice(scrollSpy.spySetState.indexOf(stateHandler), 1);
    }

    document.removeEventListener('scroll', scrollSpy.scrollHandler as any);
  },

  update: () => scrollSpy.scrollSpyContainers.forEach(c => scrollSpy.scrollHandler(c))
}

export default scrollSpy;
