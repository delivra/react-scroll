import { throttle } from "lodash";
import { addPassiveEventListener } from './passive-event-listeners';
import { isDocument } from "./utils";

// The eventHandler will execute at a rate of 15fps by default
const eventThrottler = (eventHandler: () => void, throttleAmount = 66)  => throttle(eventHandler, throttleAmount);

type SpyCallback = () => void;
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

  currentPosition(scrollSpyContainer: HTMLElement | Document) {
    const ele = isDocument(scrollSpyContainer) ? (document.scrollingElement ?? document.documentElement ?? document.body) : scrollSpyContainer;

    return {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      height: ele.scrollHeight,
      width: ele.scrollWidth
    };
  },

  scrollHandler(scrollSpyContainer: HTMLElement | Document) {
    const container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];
    const state = (container as unknown as SpyCallbackContainer)[SpyCallbackKey];
    if (!state)
      return;

    //Capture new scroll coords
    const coords = scrollSpy.currentPosition(scrollSpyContainer);

    //Detect scroll direction
    const increasing = (coords.left > state.xPosition || coords.top > state.yPosition);

    //Store new coords
    state.xPosition = coords.left;
    state.yPosition = coords.top;

    //We assume callbacks were added in ascending order, always process backwards from scroll direction
    if (increasing) {
      state.callbacks.slice().reverse().forEach(c => c());
    } else {
      state.callbacks.forEach(c => c());
    }
  },

  addStateHandler(handler: () => void) {
    scrollSpy.spySetState.push(handler);
  },

  addSpyHandler(handler: SpyCallback, scrollSpyContainer: HTMLElement | Document) {
    const container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];

    const spyCallbackContainer = container as unknown as SpyCallbackContainer
    const coords = scrollSpy.currentPosition(scrollSpyContainer);

    if(!spyCallbackContainer[SpyCallbackKey]) {
      spyCallbackContainer[SpyCallbackKey] = { 
        callbacks: [],
        xPosition: coords.left,
        yPosition: coords.top
      };
    }

    spyCallbackContainer[SpyCallbackKey]?.callbacks.push(handler);

    handler();
  },

  updateStates() {
    scrollSpy.spySetState.forEach(s => s());
  },

  unmount(stateHandler: undefined | (() => void), spyHandler: SpyCallback) {
    scrollSpy.scrollSpyContainers.forEach(container => {
      const c = (container as unknown as SpyCallbackContainer)[SpyCallbackKey];
      if (c) {
        const inx = c.callbacks.indexOf(spyHandler);
        inx > -1 && c.callbacks.splice(inx, 1)
      } 
    });

    if (stateHandler && scrollSpy.spySetState && scrollSpy.spySetState.length) {
      const inx = scrollSpy.spySetState.indexOf(stateHandler);
      inx > -1 && scrollSpy.spySetState.splice(inx, 1);
    }

    document.removeEventListener('scroll', scrollSpy.scrollHandler as any);
  },

  update: () => scrollSpy.scrollSpyContainers.forEach(c => scrollSpy.scrollHandler(c))
}

export default scrollSpy;
