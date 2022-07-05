"use strict";

export default {
 /*
  * https://github.com/oblador/angular-scroll (duScrollDefaultEasing)
  */
  defaultEasing: (x: number) => {
    if(x < 0.5) {
      return Math.pow(x*2, 2)/2;
    }
    return 1-Math.pow((1-x)*2, 2)/2;
  },
  /*
   * https://gist.github.com/gre/1650294
   */
  // no easing, no acceleration
  linear: (x: number) =>  x,
  // accelerating from zero velocity
  easeInQuad:(x: number) =>   x * x,
  // decelerating to zero velocity
  easeOutQuad: (x: number) => x * (2 - x),
  // acceleration until halfway, then deceleration
  easeInOutQuad: (x: number) =>  x < .5 ? 2 * x * x : -1 + (4 - 2 * x) * x,
  // accelerating from zero velocity 
  easeInCubic: (x: number) => x * x * x,
  // decelerating to zero velocity π
  easeOutCubic: (x: number) => (--x) * x * x + 1,
  // acceleration until halfway, then deceleration 
  easeInOutCubic: (x: number) => x < .5 ? 4 * x * x * x : (x - 1) * (2 * x - 2) * (2 * x - 2) + 1,
  // accelerating from zero velocity 
  easeInQuart: (x: number) =>  x * x * x * x,
  // decelerating to zero velocity 
  easeOutQuart: (x: number) =>  1 - (--x) * x * x * x,
  // acceleration until halfway, then deceleration
  easeInOutQuart: (x: number) =>   x < .5 ? 8 * x * x * x * x : 1 - 8 * (--x) * x * x * x,
  // accelerating from zero velocity
  easeInQuint: (x: number) =>  x * x * x * x * x,
  // decelerating to zero velocity
  easeOutQuint: (x: number) =>  1 + (--x) * x * x * x * x,
  // acceleration until halfway, then deceleration 
  easeInOutQuint: (x: number) =>   x < .5 ? 16 * x * x * x * x * x : 1 + 16 * (--x) * x * x * x * x
} as Record<string, (x: number) => number>;
