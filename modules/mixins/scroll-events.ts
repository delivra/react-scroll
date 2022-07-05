type callback = (to: string | undefined, target: HTMLElement | Document | undefined, currentPosition?: number) => void;

const Events = {
	registered : {} as Record<string, callback>,
	scrollEvent : {
		register: (evtName: string, callback: callback) => {
			Events.registered[evtName] = callback;
		},
		remove:(evtName: string) => {
			delete Events.registered[evtName];
		}
	}
};

export default Events;