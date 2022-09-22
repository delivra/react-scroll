"use strict";

import * as React from 'react';
import withScrollLink from './withScrollLink';
import scroller from '../mixins/scroller';

class ButtonElement extends React.Component<React.HTMLAttributes<HTMLInputElement>>{
  render() {
    const {children, ...inputProps} = this.props;
    return (
      <input {...inputProps}>
        {children}
      </input>
    );
  }
};

export default withScrollLink(ButtonElement, scroller);
