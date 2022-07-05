"use strict";

import * as React from 'react';
import ScrollLink from '../mixins/scroll-link';
import scroller from '../mixins/scroller';

class LinkElement extends React.Component<React.HTMLProps<HTMLAnchorElement>> {
  render = () => (<a {...this.props}>{this.props.children}</a>)
};

export default ScrollLink(LinkElement, scroller)
