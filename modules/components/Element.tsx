"use strict";
import * as React from 'react';
import withScrollElement, { ReactScrollElementInnerProps } from './withScrollElement';

class ElementWrapper extends React.Component<ReactScrollElementInnerProps & React.HTMLAttributes<HTMLDivElement>>{
  render() {
    // Remove `parentBindings` from props
    const {parentBindings, children, ...divProps}  = {...this.props};

    return (
      <div {...divProps} ref={this.setDomNode}>
        {children}
      </div>
    );
  }

  setDomNode = (el: HTMLDivElement) => {
    this.props.parentBindings.domNode = el
  }
};

export default withScrollElement(ElementWrapper);
