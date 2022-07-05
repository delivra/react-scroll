"use strict";

import * as React from 'react';
import ScrollLink from '../mixins/scroll-link';
import scroller from '../mixins/scroller';

class ButtonElement extends React.Component<React.HTMLProps<HTMLInputElement>>{
  render() {
    return (
      <input {...this.props}>
        {this.props.children}
      </input>
    );
  }
};

export default ScrollLink(ButtonElement, scroller);
