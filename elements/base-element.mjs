export class BaseElement extends HTMLElement {
	#disconnectedController = new AbortController();
	get disconnectedSignal() { return this.#disconnectedController.signal; }
	disconnectedCallback() { this.#disconnectedController.abort(); }
}
