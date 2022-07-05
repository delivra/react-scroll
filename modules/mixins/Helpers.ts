"use strict";

/* DEPRECATED */

import * as React from 'react';
import scrollSpy from './scroll-spy';
import defaultScroller, { Scroller } from './scroller';
import scrollHash from './scroll-hash';
import { ReactScrollProps } from './component-props';
import { isDocument } from './utils';
import { checkPropTypes } from 'prop-types';

type ComponentState = {
  active: boolean;
  container: HTMLElement | Document | undefined;
};

type ElementProps = {
  name: string,
  id: string
};

const Helpers = {
  Scroll(Component: React.ComponentType<any>, customScroller : Scroller | undefined) {

    console.warn("Helpers.Scroll is deprecated since v1.7.0");

    const scroller = customScroller || defaultScroller;

    class Scroll extends React.Component<ReactScrollProps, ComponentState> {
      public readonly state: ComponentState = {
        active: false,
        container: undefined
      }

      scrollTo = (to: string, props: ReactScrollProps) => {
        scroller.scrollTo(to, Object.assign({}, this.state, props));
      }

      handleClick = (event: Event) => {

        /*
         * give the posibility to override onClick
         */

        if (this.props.onClick) {
          this.props.onClick(event);
        }

        /*
         * dont bubble the navigation
         */

        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();

        /*
         * do the magic!
         */
        this.scrollTo(this.props.to, this.props);

      }


      stateHandler = () => {
        if (scroller.getActiveLink() !== this.props.to) {
          if (this.state !== null && this.state.active && this.props.onSetInactive) {
            this.props.onSetInactive();
          }
          this.setState({ active: false });
        }
      }

      spyHandler = (y: number) => {

        let scrollSpyContainer = this.getScrollSpyContainer();

        if (scrollHash.isMounted() && !scrollHash.isInitialized()) {
          return;
        }

        let to = this.props.to;
        let element = null;
        let elemTopBound = 0;
        let elemBottomBound = 0;
        let containerTop = 0;

        if (!isDocument(scrollSpyContainer) && scrollSpyContainer.getBoundingClientRect) {
          let containerCords = scrollSpyContainer.getBoundingClientRect();
          containerTop = containerCords.top;
        }

        if (!element || this.props.isDynamic) {
          element = scroller.get(to);
          if (!element) { return; }

          let cords = element.getBoundingClientRect();
          elemTopBound = (cords.top - containerTop + y);
          elemBottomBound = elemTopBound + cords.height;
        }

        let offsetY = y - (this.props.offset ?? 0);
        let isInside = (offsetY >= Math.floor(elemTopBound) && offsetY < Math.floor(elemBottomBound));
        let isOutside = (offsetY < Math.floor(elemTopBound) || offsetY >= Math.floor(elemBottomBound));
        let activeLink = scroller.getActiveLink();

        if (isOutside) {
          if (to === activeLink) {
            scroller.setActiveLink(void 0);
          }

          if (this.props.hashSpy && scrollHash.getHash() === to) {
            scrollHash.changeHash();
          }

          if (this.props.spy && this.state.active) {
            this.setState({ active: false });
            this.props.onSetInactive && this.props.onSetInactive();
          }

          return scrollSpy.updateStates();
        }

        if (isInside && activeLink !== to) {
          scroller.setActiveLink(to);

          this.props.hashSpy && scrollHash.changeHash(to);

          if (this.props.spy) {
            this.setState({ active: true });
            this.props.onSetActive && this.props.onSetActive(to);
          }
          return scrollSpy.updateStates();
        }
      }

      getScrollSpyContainer() {
        let containerId = this.props.containerId;
        let container = this.props.container;

        if (containerId) {
          container = document.getElementById(containerId) ?? undefined;
        }

        if (container && container.nodeType) {
          return container;
        }

        return document;
      }

      componentDidMount() {
        if (this.props.spy || this.props.hashSpy) {
          let scrollSpyContainer = this.getScrollSpyContainer();

          if (!scrollSpy.isMounted(scrollSpyContainer)) {
            scrollSpy.mount(scrollSpyContainer, this.props.spyThrottle);
          }

          if (this.props.hashSpy) {
            if (!scrollHash.isMounted()) {
              scrollHash.mount(scroller);
            }
            scrollHash.mapContainer(this.props.to, scrollSpyContainer);
          }

          if (this.props.spy) {
            scrollSpy.addStateHandler(this.stateHandler);
          }

          scrollSpy.addSpyHandler(this.spyHandler, scrollSpyContainer);

          this.setState({
            container: scrollSpyContainer
          });

        }
      }
      componentWillUnmount() {
        scrollSpy.unmount(this.stateHandler, this.spyHandler);
      }
      render() {
        let className = "";

        if (this.state && this.state.active) {
          className = ((this.props.className || "") + " " + (this.props.activeClass || "active")).trim();
        } else {
          className = this.props.className ?? '';
        }

        const props = {} as any;
        props.className = className;
        props.onClick = this.handleClick;
        props.children = this.props.children;

        return React.createElement(Component, props);
      }
    };
    return Scroll;
  },

  Element(Component: React.ComponentType<ElementProps>) {

    console.warn("Helpers.Element is deprecated since v1.7.0");

    class Element extends React.Component<ElementProps> {
      childBindings: {domNode: HTMLElement | null} | undefined;

      constructor(props: ElementProps) {
        super(props);
        this.childBindings = {
          domNode: null
        };
      }

      componentDidMount() {
        if (typeof window === 'undefined') {
          return false;
        }
        this.registerElems(this.props.name);
      }
      componentDidUpdate(prevProps: ElementProps) {
        if (this.props.name !== prevProps.name) {
          this.registerElems(this.props.name);
        }
      }
      componentWillUnmount() {
        if (typeof window === 'undefined') {
          return false;
        }
        defaultScroller.unregister(this.props.name);
      }
      registerElems(name: string) {
        this.childBindings && this.childBindings.domNode && defaultScroller.register(name, this.childBindings.domNode);
      }
      render() {
        return React.createElement(Component, {...this.props, ...{ parentBindings: this.childBindings }});
      }
    };

    return Element;
  }
};

export default Helpers;
