"use strict";

import * as React from 'react';
import { ReactScrollLinkProps } from '../mixins/component-props';
import ScrollElement from '../mixins/scroll-element';

class ElementWrapper extends React.Component<ReactScrollLinkProps>{
  render() {
    // Remove `parentBindings` from props
    let newProps: Partial<ReactScrollLinkProps> = {...this.props};
    if (newProps.parentBindings) {
      delete newProps.parentBindings;
    }

    return (
      <div {...newProps} ref={(el: HTMLDivElement) => { this.props.parentBindings.domNode = el; }}>
        {this.props.children}
      </div>
    );
  }
};

export default ScrollElement(ElementWrapper);
