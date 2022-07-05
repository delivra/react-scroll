import utils, { isDocument } from './utils';
import animateScroll from './animate-scroll';
import events from './scroll-events';
import { ReactScrollProps } from './component-props';

type VisibilityCallback = (isVisible: boolean) => void;

type ScrollMapping = {
  element?: HTMLElement;
  callbacks: VisibilityCallback[];
};

export class Scroller {
  __mapped: Record<string, ScrollMapping> = {}
  __activeLink: string | undefined

  unmount() {
    this.__mapped = {};
  }

  register(name: string, element: HTMLElement) {
    if (this.__mapped[name]) {
      this.__mapped[name].callbacks.forEach(c => c(true));
    }
    this.__mapped[name] = {
      element, callbacks: []
    };
  }
  
  /**
   * Subscribe to register/unregisters of elements with the given name
   */
  subscribe(name: string, visibilityHandler: VisibilityCallback) {
    if (!this.__mapped[name]) {
      this.__mapped[name] = {
        callbacks: [visibilityHandler]
      };
    } else {
      this.__mapped[name].callbacks.push(visibilityHandler);
    }
  }

  unsubscribe(name: string, visibilityHandler: VisibilityCallback) {
    if (this.__mapped[name]) {
      const inx = this.__mapped[name].callbacks.indexOf(visibilityHandler);
      inx > -1 && this.__mapped[name].callbacks.splice(inx, 1);      
    }
  }

  unregister(name: string) {
    if (this.__mapped[name]) {
      this.__mapped[name].callbacks.forEach(c => c(false));
    }

    delete this.__mapped[name];
  }

  get(name: string) : HTMLElement | undefined {
    return this.__mapped[name]?.element ?? document.getElementById(name) ?? document.getElementsByName(name)[0] ?? undefined;
  }

  setActiveLink(link: string | undefined) {
    this.__activeLink = link;
  }

  getActiveLink() {
    return this.__activeLink;
  }

  scrollTo(to: string, props: ReactScrollProps) {
    let target = this.get(to);

    if (!target) {
      console.warn(`Target element '${to}' not found`);
      return;
    }
    
    props = {...props, absolute: false};

    let containerId = props.containerId;
    let container = props.container;

    let containerElement: HTMLElement | Document;
    if (containerId) {
      container = document.getElementById(containerId) ?? undefined;
    }

    if (container && container.nodeType) {
      containerElement = container;
    } else {
      containerElement = document;
    }

    props.absolute = true;

    let horizontal = props.horizontal
    let scrollOffset = utils.scrollOffset(containerElement, target, horizontal ?? false) + (props.offset || 0);

    /*
     * if animate is not provided just scroll into the view
     */
    if (!props.smooth) {
      if (events.registered['begin']) {
        events.registered['begin'](to, target);
      }

      if (isDocument(containerElement)) {
        if (props.horizontal) {
          window.scrollTo(scrollOffset, 0);
        } else {
          window.scrollTo(0, scrollOffset);
        }
      } else {
        containerElement.scrollTop = scrollOffset;
      }

      if (events.registered['end']) {
        events.registered['end'](to, target);
      }

      return;
    }

    /*
     * Animate scrolling
     */
    animateScroll.animateTopScroll(scrollOffset, props, to, target);
  }
}

const scroller = new Scroller();
export default scroller;