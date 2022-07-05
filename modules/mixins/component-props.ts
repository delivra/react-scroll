import * as React from "react";

export interface ReactScrollProps {
  /**
   * Target to scroll to
   */
  to: string;

  /**
   * class applied at all times
   */
  className?: string;

  /**
   * Container element's name/d to listen for scroll events and to perform scrolling in
   */
  containerId?: string;

  /**
   * Container element to listen for scroll events and to perform scrolling in
   */
  container?: HTMLElement | Document;
  children?: React.ReactNode;

  /**
   * class applied when element is reached
   */
  activeClass?: string;

  /**
   * Make Link selected when scroll is at its targets position
   */
  spy?: boolean;

  /**
   * 	Whether to scroll vertically (`false`) or horizontally (`true`) - default: `false`
   */
  horizontal?: boolean;

  /**
   * 	Animate the scrolling
   */
  smooth?: boolean | string;

  /**
   * 	Scroll additional px ( like padding )
   */
  offset?: number;

  /**
   * 	Wait x milliseconds before scroll
   */
  delay?: number;

  /**
   * 	In case the distance has to be recalculated - if you have content that expands etc.
   */
  isDynamic?: boolean;
  
  /**
   * Invoked whenever link is clicked
   */
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;

  /**
   * time of the scroll animation - can be a number or a function (`function (scrollDistanceInPx) { return duration; }`), that allows more granular control at run-time
   */
  duration?: number | ((x: number) => number);
  absolute?: boolean;

  /**
   * Invoke whenever link is being set to active
   */
  onSetActive?: (to: string, element?: HTMLElement | Document) => void;

  /**
   * 	Invoke whenever link is lose the active status
   */
  onSetInactive?: (to?: string, element?: HTMLElement | Document) => void;

  /**
   * Ignores events which cancel animated scrolling
   */
  ignoreCancelEvents?: boolean;

  /**
   * Update hash based on spy, containerId has to be set to scroll a specific element
   */
  hashSpy?: boolean;

  /**
   * Whether hash updates should push new history entries or replace the current entry
   */
  saveHashHistory?: boolean;

  /**
   * Time of the spy throttle - can be a number
   */
  spyThrottle?: number;

  /**
   * Whether link should remain active until another link becomes active (true) or immediately deactivate upon scrolling past the element (false)
   */
  sticky?: boolean;
}

export type ReactScrollLinkProps = {  
  className?: string;
  children?: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLElement>;
};

export type ReactScrollElementProps = {
  children?: React.ReactNode;
  parentBindings: {
    domNode: HTMLElement;
  }
} & React.HTMLProps<HTMLDivElement>;
