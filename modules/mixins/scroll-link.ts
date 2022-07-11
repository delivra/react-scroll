import * as React from 'react';

import scrollSpy from './scroll-spy';
import defaultScroller, { Scroller } from './scroller';
import scrollHash from './scroll-hash';
import { ReactScrollLinkProps, ReactScrollProps } from './component-props';
import { isDocument } from './utils';

type LinkState = {
  active: boolean,
  visible: boolean,
  container: HTMLElement | Document | undefined
};

export default (Component: React.ComponentType<ReactScrollLinkProps>, customScroller: Scroller) => {
  const scroller = customScroller || defaultScroller;

  class Link extends React.PureComponent<ReactScrollProps, LinkState> {
    public readonly state: LinkState = {
      active: false,
      visible: true,
      container: undefined
    }

    scrollTo = (to: string, props: ReactScrollProps) => {
      scroller.scrollTo(to, {...this.state, ...props});
    }

    handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
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

    getScrollCoords(element: HTMLElement) {
      const result = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };

      const scrollSpyContainer = this.getScrollSpyContainer();
      if (!isDocument(scrollSpyContainer) && scrollSpyContainer.getBoundingClientRect) {
        const containerCords = scrollSpyContainer.getBoundingClientRect();
        result.left -= containerCords.left;
        result.top -= containerCords.top;
      }

      const rect = element.getBoundingClientRect();
      result.left += rect.left;
      result.right = result.left + rect.width;

      result.top += rect.top;
      result.bottom = result.top + rect.height;

      return result;
    }

    spyHandler = () => {
      if (scrollHash.isMounted() && !scrollHash.isInitialized()) {
        return;
      }

      const { horizontal = false, to, offset = 0 } = this.props;
      const element = scroller.get(to);
      if (!element) { 
        return; 
      }

      const coords = this.getScrollCoords(element);

      let isInside: boolean;
      if (this.props.sticky) {
        const scrollSpyContainer = this.getScrollSpyContainer();
        isInside = scroller.getClosest(scrollSpyContainer, this.props) === element;
      } else {
        if (horizontal) {
          isInside = (offset >= Math.floor(coords.left) && offset < Math.floor(coords.right));
        } else {
          isInside = (offset >= Math.floor(coords.top) && offset < Math.floor(coords.bottom));
        }
      }

      const activeLink = scroller.getActiveLink();
      if (!isInside) {
        if (to === activeLink) {
          scroller.setActiveLink(void 0);
        }

        if (this.props.hashSpy && scrollHash.getHash() === to) {
          const { saveHashHistory = false } = this.props
          scrollHash.changeHash("", saveHashHistory);
        }

        if (this.props.spy && this.state.active) {
          this.setState({ active: false });
          this.props.onSetInactive && this.props.onSetInactive(to, element);
        }
      }

      if (isInside && (activeLink !== to || this.state.active === false)) {
        scroller.setActiveLink(to);
        const { saveHashHistory = false } = this.props
        this.props.hashSpy && scrollHash.changeHash(to, saveHashHistory);

        if (this.props.spy) {
          this.setState({ active: true });
          this.props.onSetActive && this.props.onSetActive(to, element);
        }
      }
    }

    visibilityHandler = (isVisible: boolean) => {
      const toggling = isVisible && !this.state.visible;
      this.setState({
        visible: this.props.autoHide ? isVisible : true
      });

      if (toggling) {
        //This is probably needed
        this.spyHandler();
      }
    }

    getScrollSpyContainer() {
      let containerId = this.props.containerId;
      let container = this.props.container;

      if (containerId && !container) {
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

        if (this.props.autoHide) {
          scroller.subscribe(this.props.to, this.visibilityHandler);
        }
        scrollSpy.addSpyHandler(this.spyHandler, scrollSpyContainer);

        this.setState({
          container: scrollSpyContainer,
          visible: this.props.autoHide ? !!scroller.get(this.props.to) : true
        });
      }
    }

    componentWillUnmount() {
      scroller.unsubscribe(this.props.to, this.visibilityHandler);
      scrollSpy.unmount(undefined, this.spyHandler);
    }

    render() {
      var className = "";

      if (this.state && this.state.active) {
        className = ((this.props.className || "") + " " + (this.props.activeClass || "active")).trim();
      } else {
        className = this.props.className ?? '';
      }

      const props : ReactScrollLinkProps = {
        className: className,
        onClick: this.handleClick,
        children: this.props.children
      };

      if (this.state.visible) {
        return React.createElement(Component, props);
      } else {
        return null;
      }
    }
  };

  return Link;
}
