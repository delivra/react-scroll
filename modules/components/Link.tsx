"use strict";

import * as React from 'react';
import ScrollLink from '../mixins/scroll-link';
import scroller from '../mixins/scroller';

class LinkElement extends React.Component<React.HTMLAttributes<HTMLAnchorElement>> {
  render = () => {
    const {children, ...linkProps} = this.props;

    return <a {...linkProps}>{children}</a>;
  }
};

export default ScrollLink(LinkElement, scroller)
