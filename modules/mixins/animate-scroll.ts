import utils, {isDocument} from './utils';
import smooth from './smooth';
import cancelEvents from './cancel-events';
import events from './scroll-events';
import { ReactScrollProps } from './component-props';

/**
 * Gets the easing type from the smooth prop within options.
 */
const getAnimationType = (options : ReactScrollProps) => typeof options.smooth === 'string' && smooth[options.smooth] || smooth.defaultEasing;

/**
 * Function helper
 */
const functionWrapper = (value : number | ((x: number) => number)) => typeof value === 'function' ? value :  (function () { return value; });

/**
 * Wraps window properties to allow server side rendering
 */
const currentWindowProperties = () => {
  if (typeof window !== 'undefined') {
    if (window.requestAnimationFrame) {
      return window.requestAnimationFrame;
    }
    if ((window as any).webkitRequestAnimationFrame) {
      return (window as any).webkitRequestAnimationFrame as (callback: FrameRequestCallback) => number;
    }
  }
};

/**
 * Helper function to never extend 60fps on the webpage.
 */
const requestAnimationFrameHelper = (() => {
  return currentWindowProperties() ??
    function (callback: TimerHandler) {
      const delay = undefined;
      window.setTimeout(callback, delay || (1000 / 60), new Date().getTime());
    };
})();

const defaultData = {
  currentPosition: 0,
  startPosition: 0,
  targetPosition: 0,
  progress: 0,
  duration: 0,
  cancel: false,

  target: undefined as HTMLElement | Document | undefined,
  containerElement: undefined as HTMLElement | Document | undefined,
  to: undefined as string | undefined,
  start: undefined as number | undefined,
  delta: undefined as number | undefined,
  percent: undefined as number | undefined,
  delayTimeout: undefined as number | undefined
};

type OptionsType = ReactScrollProps & {
  data: typeof defaultData;
}

const makeData = () => ({...defaultData});

const currentPositionX = (options: OptionsType) => {
  const containerElement = options.data.containerElement;
  if (containerElement && !isDocument(containerElement) && containerElement !== document.body) {
    return containerElement.scrollLeft;
  } else {
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    return supportPageOffset ? window.pageXOffset : isCSS1Compat ?
      document.documentElement.scrollLeft : document.body.scrollLeft;
  }
};

const currentPositionY = (options: OptionsType) => {
  const containerElement = options.data.containerElement;
  if (containerElement && !isDocument(containerElement) && containerElement !== document.body) {
    return containerElement.scrollTop;
  } else {
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    return supportPageOffset ? window.pageYOffset : isCSS1Compat ?
      document.documentElement.scrollTop : document.body.scrollTop;
  }
};

const scrollContainerWidth = (options: OptionsType) => {
  const containerElement = options.data.containerElement;
  if (containerElement && !isDocument(containerElement) && containerElement !== document.body) {
    return containerElement.scrollWidth - containerElement.offsetWidth;
  } else {
    let body = document.body;
    let html = document.documentElement;

    return Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    );
  }
};

const scrollContainerHeight = (options: OptionsType) => {
  const containerElement = options.data.containerElement;
  if (containerElement && !isDocument(containerElement) && containerElement !== document.body) {
    return containerElement.scrollHeight - containerElement.offsetHeight;
  } else {
    let body = document.body;
    let html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  }
};

const animateScroll = (easing: (x: number) => number, options: OptionsType, timestamp: number) => {
  const data = options.data;

  // Cancel on specific events
  if (!options.ignoreCancelEvents && data.cancel) {
    if (events.registered['end']) {
      events.registered['end'](data.to, data.target, data.currentPosition);
    }
    return
  };

  data.delta = Math.round(data.targetPosition - data.startPosition);

  if (data.start === undefined) {
    data.start = timestamp;
  }

  data.progress = timestamp - data.start;

  data.percent = (data.progress >= data.duration ? 1 : easing(data.progress / data.duration));

  data.currentPosition = data.startPosition + Math.ceil(data.delta * data.percent);

  if (data.containerElement && !isDocument(data.containerElement) && data.containerElement !== document.body) {
    if (options.horizontal) {
      data.containerElement.scrollLeft = data.currentPosition;
    } else {
      data.containerElement.scrollTop = data.currentPosition;
    }
  } else {
    if (options.horizontal) {
      window.scrollTo(data.currentPosition, 0);
    } else {
      window.scrollTo(0, data.currentPosition);
    }
  }

  if (data.percent < 1) {
    let easedAnimate = animateScroll.bind(null, easing, options);
    requestAnimationFrameHelper(easedAnimate);
    return;
  }

  if (events.registered['end']) {
    events.registered['end'](data.to, data.target, data.currentPosition);
  }

};

const setContainer = (options: OptionsType) => {
  options.data.containerElement = (!options
    ? undefined
    : options.containerId
      ? document.getElementById(options.containerId)
      : options.container && options.container.nodeType
        ? options.container
        : document) ?? undefined;
};

const animateTopScroll = (scrollOffset: number, inputOptions: ReactScrollProps, to?: string, target?: HTMLElement | Document) => {
  const options = proceedOptions({...inputOptions, ...{data:undefined}});

  window.clearTimeout(options.data.delayTimeout);

  cancelEvents.subscribe(() => {
    options.data.cancel = true;
  });

  setContainer(options);

  options.data.start = undefined;
  options.data.cancel = false;
  options.data.startPosition = options.horizontal ? currentPositionX(options) : currentPositionY(options);
  options.data.targetPosition = options.absolute
    ? scrollOffset
    : scrollOffset + options.data.startPosition;

  if (options.data.startPosition === options.data.targetPosition) {
    if (events.registered['end']) {
      events.registered['end'](options.data.to, options.data.target, options.data.currentPosition);
    }
    return;
  }

  options.data.delta = Math.round(options.data.targetPosition - options.data.startPosition);

  options.data.duration = functionWrapper(options.duration ?? 0)(options.data.delta);
  options.data.duration = isNaN(options.data.duration) ? 1000 : options.data.duration;
  options.data.to = to;
  options.data.target = target;

  let easing = getAnimationType(options);
  let easedAnimate = animateScroll.bind(null, easing, options);

  if (options && options.delay && options.delay > 0) {
    options.data.delayTimeout = window.setTimeout(() => {
      if (events.registered['begin']) {
        events.registered['begin'](options.data.to, options.data.target);
      }
      requestAnimationFrameHelper(easedAnimate);
    }, options.delay);
    return;
  }

  if (events.registered['begin']) {
    events.registered['begin'](options.data.to, options.data.target);
  }
  requestAnimationFrameHelper(easedAnimate);

};

const proceedOptions = (inputOptions: ReactScrollProps & { data: typeof defaultData | undefined}) => {
  const options = {...inputOptions};
  options.data = options.data || makeData();
  options.absolute = true;
  return options as OptionsType;
}

const scrollToTop = (options: OptionsType) => {
  animateTopScroll(0, proceedOptions(options));
};

const scrollTo = (toPosition: number, options: OptionsType) => {
  animateTopScroll(toPosition, proceedOptions(options));
};

const scrollToBottom = (options: OptionsType) => {
  options = proceedOptions(options);
  setContainer(options);
  animateTopScroll(options.horizontal
    ? scrollContainerWidth(options)
    : scrollContainerHeight(options),
    options);
};

const scrollMore = (toPosition: number, options: OptionsType) => {
  options = proceedOptions(options);
  setContainer(options);
  const currentPosition = options.horizontal ? currentPositionX(options) : currentPositionY(options)
  animateTopScroll(toPosition + currentPosition, options);
};

export default {
  animateTopScroll,
  getAnimationType,
  scrollToTop,
  scrollToBottom,
  scrollTo,
  scrollMore,
};