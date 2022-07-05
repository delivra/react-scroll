import * as React from 'react';

import scrollSpy from './scroll-spy';
import defaultScroller, { Scroller } from './scroller';
import scrollHash from './scroll-hash';
import { ReactScrollLinkProps, ReactScrollProps } from './component-props';
import { isDocument } from './utils';

type LinkState = {
  active: boolean,
  container: HTMLElement | Document | undefined
};

export default (Component: React.ComponentType<ReactScrollLinkProps>, customScroller: Scroller) => {
  const scroller = customScroller || defaultScroller;

  class Link extends React.PureComponent<ReactScrollProps, LinkState> {
    public readonly state: LinkState = {
      active: false,
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

    spyHandler = (x: number, y: number) => {
      let scrollSpyContainer = this.getScrollSpyContainer();

      if (scrollHash.isMounted() && !scrollHash.isInitialized()) {
        return;
      }

      const {horizontal} = this.props;
      let to = this.props.to;
      let element = null;
      let isInside;
      let isOutside;

      if (horizontal) {
        let elemLeftBound = 0;
        let elemRightBound = 0;
        let containerLeft = 0;

        if (!isDocument(scrollSpyContainer) && scrollSpyContainer.getBoundingClientRect) {
          let containerCords = scrollSpyContainer.getBoundingClientRect();
          containerLeft = containerCords.left;
        }

        if (!element || this.props.isDynamic) {
          element = scroller.get(to);
          if (!element) { return; }

          let cords = element.getBoundingClientRect();
          elemLeftBound = (cords.left - containerLeft + x);
          elemRightBound = elemLeftBound + cords.width;
        }

        let offsetX = x - (this.props.offset ?? 0);
        isInside = (offsetX >= Math.floor(elemLeftBound) && offsetX < Math.floor(elemRightBound));
        isOutside = (offsetX < Math.floor(elemLeftBound) || offsetX >= Math.floor(elemRightBound));
      } else {
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
        isInside = (offsetY >= Math.floor(elemTopBound) && offsetY < Math.floor(elemBottomBound));
        isOutside = (offsetY < Math.floor(elemTopBound) || offsetY >= Math.floor(elemBottomBound));
      }

      let activeLink = scroller.getActiveLink();

      if (isOutside) {
        if (this.props.sticky) {
          //Sticky behavior, don't set scroller to inactive
          if (activeLink && to !== activeLink) {
            //Time to change            
            if (this.props.spy && this.state.active) {
              this.setState({ active: false });
              this.props.onSetInactive && this.props.onSetInactive(to, element);
            }
          }
        } else {
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

        scrollSpy.addSpyHandler(this.spyHandler, scrollSpyContainer);

        this.setState({
          container: scrollSpyContainer
        });

      }
    }
    componentWillUnmount() {
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
      
      return React.createElement(Component, props);
    }
  };

  return Link;
}
