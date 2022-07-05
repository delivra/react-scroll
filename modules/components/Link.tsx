"use strict";

import * as React from 'react';
import { ReactScrollLinkProps } from '../mixins/component-props';
import ScrollLink from '../mixins/scroll-link';
import scroller from '../mixins/scroller';

class LinkElement extends React.Component<ReactScrollLinkProps> {
  render = () => (<a {...this.props}>{this.props.children}</a>)
};

export default ScrollLink(LinkElement, scroller)
