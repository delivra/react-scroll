import { Scroller } from './scroller';
import utils from './utils';

const scrollHash = {
  mountFlag: false,
  initialized: false,
  scroller: null as Scroller | null,
  containers: {} as Record<string, HTMLElement | Document>,

  mount(scroller : Scroller) {
    this.scroller = scroller;

    this.handleHashChange = this.handleHashChange.bind(this);
    window.addEventListener('hashchange', this.handleHashChange);

    this.initStateFromHash();
    this.mountFlag = true;
  },

  mapContainer(to: string, container: HTMLElement | Document) {
    this.containers[to] = container;
  },

  isMounted() {
    return this.mountFlag;
  },

  isInitialized() {
    return this.initialized;
  },

  initStateFromHash() {
    let hash = this.getHash();
    if (hash) {
      window.setTimeout(() => {
        this.scrollTo(hash, true);
        this.initialized = true;
      }, 10);
    } else {
      this.initialized = true;
    }
  },

  scrollTo(to: string, isInit?: boolean) {
    let scroller = this.scroller;
    if (scroller) {
      let element = scroller.get(to);
      if (element && (isInit || to !== scroller.getActiveLink())) {
        let container = this.containers[to] || document;
        scroller.scrollTo(to, { to, container });
      }
    }
  },

  getHash() {
    return utils.getHash();
  },

  changeHash(to?: string, saveHashHistory?: boolean) {
    if (this.isInitialized() && utils.getHash() !== to) {
      utils.updateHash(to, saveHashHistory);
    }
  },

  handleHashChange() {
    this.scrollTo(this.getHash());
  },

  unmount() {
    this.scroller = null;
    this.containers = {};
    window.removeEventListener('hashchange', this.handleHashChange);
  },
};

export default scrollHash;
