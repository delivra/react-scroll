import { addPassiveEventListener, removePassiveEventListener } from './passive-event-listeners';
const events = ['mousedown', 'mousewheel', 'touchmove', 'keydown']

export default {
  subscribe : (cancelEvent: EventListenerOrEventListenerObject) => (typeof document !== 'undefined') && events.forEach(event => addPassiveEventListener(document, event, cancelEvent)),
};
