import * as utils from './utils';
import animateScroll from './animate-scroll';
import events from './scroll-events';
import { ReactScrollProps } from './component-props';

type VisibilityCallback = (isVisible: boolean) => void;

type ScrollMapping = {
  element?: HTMLElement;
  callbacks: VisibilityCallback[];
};

/** Check if the given element is currently visible */
function isVisible(elem?: HTMLElement) {
  if (!elem) {
    return false;
  }

  //Stolen from jQuery
  return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
}

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
    } else {
      this.__mapped[name] = {
        callbacks: []
      }
    }

    this.__mapped[name].element = element;

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
      const map = this.__mapped[name];
      map.callbacks.push(visibilityHandler);
      
      if (map.element) {
        //Call immediately if already registered
        visibilityHandler(true);
      }
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

    delete this.__mapped[name].element;
  }

  get(name: string) : HTMLElement | undefined {
    return this.__mapped[name]?.element ?? document.getElementById(name) ?? document.getElementsByName(name)[0] ?? undefined;
  }

  getClosest(container: HTMLElement | Document, props: ReactScrollProps) : HTMLElement | undefined {
    const elements = Object.values(this.__mapped).map(m => m.element).filter(isVisible) as HTMLElement[];

    const { horizontal = false } = props;
    const currentPosition = utils.currentPosition(container);
    
    //The reference point within the container to detect for collision
    const referencePercent = this.getReferencePoint(props, currentPosition);
    const referenceOffset = horizontal ? (currentPosition.left + referencePercent * currentPosition.width) : (currentPosition.top + referencePercent * currentPosition.height);

    //Calculate how close to the reference point each element is
    const mapped = elements.map(element => {
      const offset = utils.scrollOffset(container, element, horizontal);
      const deltaStart = referenceOffset - offset;
      const deltaEnd = horizontal ? referenceOffset - (offset + element.offsetWidth) : referenceOffset - (offset + element.offsetHeight);
      const delta = Math.sign(deltaStart) !== Math.sign(deltaEnd) ? 0 : Math.min(Math.abs(deltaStart), Math.abs(deltaEnd));
      return { element, offset, delta };
    });

    //Select the closest element by sorting
    mapped.sort((a,b) => a.delta - b.delta);
    return mapped[0]?.element;
  }

  private getReferencePoint(props: ReactScrollProps, currentPosition: { left: number; top: number; height: number; width: number; totalHeight: number; totalWidth: number; }) {
    const { horizontal = false, referencePoint } = props;
    switch (referencePoint) {
      case "Start":
        //Top/Left
        return 0;
      case "Middle":
        return 0.5;
      case "End":
        //Bottom/Right
        return 1;      
      case "Sliding":
        //Calculate the percentage that the container has been scrolled, and change the reference point based on that
        if (horizontal) {
            const isScrollable = Math.abs(currentPosition.totalWidth - currentPosition.width) > 1;
            if (!isScrollable)
              return 0;

            return currentPosition.left / (currentPosition.totalWidth - currentPosition.width);
        } else {
            const isScrollable = Math.abs(currentPosition.totalHeight - currentPosition.height) > 1;
            if (!isScrollable)
              return 0;

            return currentPosition.top / (currentPosition.totalHeight - currentPosition.height);
        }
      default:
        //Default to 'Start'
        return 0;
    }
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

    let scrollOffset = utils.scrollOffset(containerElement, target, horizontal) + offset;
    const containerPosition = utils.currentPosition(containerElement);

    //Override position to calculate based on the element position rather than scroll position
    const referencePercent = this.getReferencePoint(props, {
      ...containerPosition, 
      left: scrollOffset,
      top: scrollOffset,
      height: 0,
      width: 0
    });

    if (referencePercent > 0) {
      //Correct the scrolloffset to put the viewport at the correct referencePoint
      scrollOffset -= referencePercent * containerPosition.height;
      scrollOffset += referencePercent * target.clientHeight;
    }

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