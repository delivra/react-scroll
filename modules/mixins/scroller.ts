import * as utils from './utils';
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
    let callbacks;
    if (this.__mapped[name]) {
      callbacks = this.__mapped[name].callbacks;
    }

    this.__mapped[name] = {
      element, callbacks: []
    };

    callbacks?.forEach(c => c(true));
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

  getClosest(container: HTMLElement | Document, props: ReactScrollProps) : HTMLElement | undefined {
    const elements = Object.values(this.__mapped).map(m => m.element).filter(Boolean) as HTMLElement[];

    const { horizontal = false } = props;
    const currentPosition = utils.currentPosition(container);

    //Calculate how close to the reference point each element is
    const mapped = elements.map(element => {
      const offset = utils.scrollOffset(container, element, horizontal);
      const deltaStart = horizontal ? currentPosition.left - offset : currentPosition.top - offset;
      const deltaEnd = horizontal ? currentPosition.left - (offset + element.offsetWidth) : currentPosition.top - (offset + element.offsetHeight);
      const delta = Math.sign(deltaStart) !== Math.sign(deltaEnd) ? 0 : Math.min(Math.abs(deltaStart), Math.abs(deltaEnd));
      return { element, offset, delta };
    });

    //Select the closest element by sorting
    mapped.sort((a,b) => a.delta - b.delta);
    return mapped[0]?.element;
  }

  setActiveLink(link: string | undefined) {
    this.__activeLink = link;
  }

  getActiveLink() {
    return this.__activeLink;
  }

  scrollTo(to: string, props: ReactScrollProps) {
    const target = this.get(to);

    if (!target) {
      console.warn(`Target element '${to}' not found`);
      return;
    }
    
    props = {...props, absolute: false};

    const { containerId, offset = 0, horizontal = false } = props;
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

    const scrollOffset = utils.scrollOffset(containerElement, target, horizontal) + offset;

    /*
     * if animate is not provided just scroll into the view
     */
    if (!props.smooth) {
      if (events.registered['begin']) {
        events.registered['begin'](to, target);
      }

      if (utils.isDocument(containerElement)) {
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