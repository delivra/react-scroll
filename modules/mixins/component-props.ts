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
   * Whether link should stick to the closest element (true) or only activate when scrolling inside an element (false)
   */
  sticky?: boolean;

  /**
   * Which part of the container's viewport must be inside a scroll element to consider it active.
   * Start: (default) The top/left
   * Middle: The center/middle
   * End: The bottom/right
   * Sliding: "Start" when all the way to the top/left, "End" when all the way to the bottom/right, and slides in between
   */
  referencePoint?: "Start" | "Middle" | "End" | "Sliding";

  /**
   * Whether link should automatically hide itself is the target element isn't available
   */
  autoHide?: boolean;
}