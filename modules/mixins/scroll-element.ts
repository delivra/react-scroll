import * as React from 'react';
import { ReactScrollElementProps } from './component-props';
import scroller from './scroller';

type ComponentProps = {
  name: string;
  id:   string;
};

export default (Component:React.ComponentType<ReactScrollElementProps>) => {
  class Element extends React.Component<ComponentProps> {
    childBindings = {
      domNode: undefined as HTMLElement | undefined
    }
    
    componentDidMount() {
      if (typeof window === 'undefined') {
        return false;
      }
      this.registerElems(this.props.name);
    }
    componentDidUpdate(prevProps: ComponentProps) {
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
      const props: ReactScrollElementProps = {
        ...this.props,
        parentBindings: {
          domNode: this.childBindings.domNode!
        }
      };

      return React.createElement(Component, props);
    }
  };
  
  return Element;
}