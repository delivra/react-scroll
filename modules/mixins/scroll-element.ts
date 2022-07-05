import * as React from 'react';
import scroller from './scroller';

type ComponentProps = {
  name: string;
  id:   string;
};

type ElementWrapperProps = {
  parentBindings: {
    domNode: HTMLElement;
  }
} & React.HTMLProps<HTMLDivElement>;

export default (Component:React.ComponentType<any>) => {
    class Element extends React.Component<ComponentProps>{
      childBindings = {
        domNode: null as HTMLElement | null
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
        return React.createElement(Component, {...this.props, ...{ parentBindings: this.childBindings }});
      }
    };
    return Element;
  }