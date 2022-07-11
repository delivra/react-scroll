import { throttle } from "lodash";
import { addPassiveEventListener } from './passive-event-listeners';

// The eventHandler will execute at a rate of 15fps by default
const eventThrottler = (eventHandler: () => void, throttleAmount = 66)  => throttle(eventHandler, throttleAmount);

type SpyCallback = () => void;
type SpyCallbackState = {
  callbacks: SpyCallback[];
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

  scrollHandler(scrollSpyContainer: HTMLElement | Document) {
    const container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];
    const state = (container as unknown as SpyCallbackContainer)[SpyCallbackKey];
    if (!state)
      return;
 
    state.callbacks.forEach(c => c());
  },

  addStateHandler(handler: () => void) {
    scrollSpy.spySetState.push(handler);
  },

  addSpyHandler(handler: SpyCallback, scrollSpyContainer: HTMLElement | Document) {
    const container = scrollSpy.scrollSpyContainers[scrollSpy.scrollSpyContainers.indexOf(scrollSpyContainer)];

    const spyCallbackContainer = container as unknown as SpyCallbackContainer

    if(!spyCallbackContainer[SpyCallbackKey]) {
      spyCallbackContainer[SpyCallbackKey] = { 
        callbacks: []
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
