"use strict";

import * as React from 'react';
import { ReactScrollElementProps } from '../mixins/component-props';
import ScrollElement from '../mixins/scroll-element';

class ElementWrapper extends React.Component<ReactScrollElementProps>{
  render() {
    // Remove `parentBindings` from props
    let newProps: Partial<ReactScrollElementProps> = {...this.props};
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
