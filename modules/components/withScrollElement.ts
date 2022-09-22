import * as React from 'react';
import scroller from '../mixins/scroller';

export type ReactScrollElementProps = {
  name: string;
};

export type ReactScrollElementInnerProps = ReactScrollElementProps & {
  parentBindings: {
    domNode?: HTMLElement;
  };
};

export default <T extends HTMLElement>(Component: React.ComponentType<ReactScrollElementInnerProps & React.HTMLAttributes<T>>) => {
  class Element extends React.Component<ReactScrollElementProps & React.HTMLAttributes<T>> {
    childBindings = {
      domNode: undefined as T | undefined
    }
    
    componentDidMount() {
      if (typeof window === 'undefined') {
        return false;
      }
      this.registerElems(this.props.name);
    }

    componentDidUpdate(prevProps: ReactScrollElementProps & React.HTMLAttributes<T>) {
      if (this.props.name !== prevProps.name) {
        this.registerElems(this.props.name);
      }
    }

    componentWillUnmount() {
      if (typeof window === 'undefined') {
        return false;
      }
      scroller.unregister(this.props.name);
    }

    registerElems(name: string) {
      this.childBindings.domNode && scroller.register(name, this.childBindings.domNode);
    }
    
    render() {
      const props = {
        ...this.props,
        parentBindings: this.childBindings
      };

      return React.createElement(Component, props);
    }
  };
  
  return Element;
}