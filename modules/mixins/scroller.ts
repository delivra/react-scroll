import utils, { isDocument } from './utils';
import animateScroll from './animate-scroll';
import events from './scroll-events';
import { ReactScrollProps } from './component-props';

export class Scroller {
  __mapped: Record<string, HTMLElement> = {}
  __activeLink: string | undefined

  unmount() {
    this.__mapped = {};
  }

  register(name: string, element: HTMLElement){
    this.__mapped[name] = element;
  }

  unregister(name: string) {
    delete this.__mapped[name];
  }

  get(name: string) : HTMLElement {
    return this.__mapped[name] || document.getElementById(name) || document.getElementsByName(name)[0];
  }

  setActiveLink(link: string | undefined) {
    this.__activeLink = link;
  }

  getActiveLink() {
    return this.__activeLink
  }

  scrollTo(to: string, props: ReactScrollProps) {

    let target = this.get(to);

    if (!target) {
      console.warn("target Element not found");
      return;
    }

    props = Object.assign({}, props, { absolute: false });

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