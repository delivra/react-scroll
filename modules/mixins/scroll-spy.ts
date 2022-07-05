import { throttle } from "lodash";
import { addPassiveEventListener } from './passive-event-listeners';
import { isDocument } from "./utils";

// The eventHandler will execute at a rate of 15fps by default
const eventThrottler = (eventHandler: () => void, throttleAmount = 66)  => throttle(eventHandler, throttleAmount);

type SpyCallback = (x: number, y: number) => void;
type SpyCallbackState = {
  callbacks: SpyCallback[];
  xPosition: number;
  yPosition: number;
};
const SpyCallbackKey = Symbol("SpyCallback");

type SpyCallbackContainer = {
  [SpyCallbackKey]?: SpyCallbackState,
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
    const state = (container as unknown as SpyCallbackContainer)[SpyCallbackKey];
    if (!state)
      return;

    //Capture new scroll coords
    const xPosition = scrollSpy.currentPositionX(scrollSpyContainer);
    const yPosition = scrollSpy.currentPositionY(scrollSpyContainer);

    //Detect scroll direction
    const increasing = (xPosition > state.xPosition || yPosition > state.yPosition);

    //Store new coords
    state.xPosition = xPosition;
    state.yPosition = yPosition;

    //We assume callbacks were added in ascending order, always process backwards from scroll direction
    if (increasing) {
      state.callbacks.slice().reverse().forEach(c => c(xPosition, yPosition));
    } else {
      state.callbacks.forEach(c => c(xPosition, yPosition));
    }
  },

  addStateHandler(handler: () => void) {
    scrollSpy.spySetState.push(handler);
  },

  addSpyHandler(handler: SpyCallback, scrollSpyContainer: HTMLElement | Document) {
    const container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];

    const spyCallbackContainer = container as unknown as SpyCallbackContainer
    if(!spyCallbackContainer[SpyCallbackKey]) {
      spyCallbackContainer[SpyCallbackKey] = { 
        callbacks: [],
        xPosition: this.currentPositionX(scrollSpyContainer),
        yPosition: this.currentPositionY(scrollSpyContainer)
      };
    }

    spyCallbackContainer[SpyCallbackKey]?.callbacks.push(handler);

    handler(scrollSpy.currentPositionX(scrollSpyContainer), scrollSpy.currentPositionY(scrollSpyContainer));
  },

  updateStates() {
    scrollSpy.spySetState.forEach(s => s());
  },

  unmount(stateHandler: undefined | (() => void), spyHandler: SpyCallback) {
    scrollSpy.scrollSpyContainers.forEach(container => {
      const c = (container as unknown as SpyCallbackContainer)[SpyCallbackKey];
      if (c) {
        c.callbacks.splice(c.callbacks.indexOf(spyHandler), 1)
      } 
    });

    if (stateHandler && scrollSpy.spySetState && scrollSpy.spySetState.length) {
      scrollSpy.spySetState.splice(scrollSpy.spySetState.indexOf(stateHandler), 1);
    }

    document.removeEventListener('scroll', scrollSpy.scrollHandler as any);
  },

  update: () => scrollSpy.scrollSpyContainers.forEach(c => scrollSpy.scrollHandler(c))
}

export default scrollSpy;
