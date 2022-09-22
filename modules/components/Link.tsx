"use strict";

import * as React from 'react';
import withScrollLink from './withScrollLink';
import scroller from '../mixins/scroller';

class LinkElement extends React.Component<React.HTMLAttributes<HTMLAnchorElement>> {
  render = () => {
    const {children, ...linkProps} = this.props;

    return <a {...linkProps}>{children}</a>;
  }
};

export default withScrollLink(LinkElement, scroller)
