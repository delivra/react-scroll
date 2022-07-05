"use strict";

import * as React from 'react';
import { ReactScrollLinkProps } from '../mixins/component-props';
import ScrollLink from '../mixins/scroll-link';
import scroller from '../mixins/scroller';

class ButtonElement extends React.Component<ReactScrollLinkProps>{
  render() {
    return (
      <input {...this.props}>
        {this.props.children}
      </input>
    );
  }
};

export default ScrollLink(ButtonElement, scroller);
