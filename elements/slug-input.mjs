import kebabCase from 'just-kebab-case';

const html = String.raw;

export class SlugInputElement extends HTMLElement {
	static formAssociated = true;
	#internals;
	#overridden = false;

	get #inputElement() { return this.shadowRoot.querySelector(':host > input'); }
	#template = html`
		<input pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$">
	`;

	connectedCallback() {
		if (!this.shadowRoot) {
			this.#internals = this.attachInternals();
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = this.#template;
			this.innerHTML = '';
		}

		this.#disconnectionController = new AbortController();
		const removeOnDisconnect = {signal: this.#disconnectionController.signal};

		this.#inputElement.addEventListener('input', event => {
			this.#overridden = true;
			this.#internals.setFormValue(event.target.value);
		}, removeOnDisconnect);

		this.ownerDocument.getElementById(this.from)?.addEventListener('input', event => {
			if (this.#overridden) return;

			this.#inputElement.value = kebabCase(event.target.value);
			this.#internals.setFormValue(this.#inputElement.value);
		}, removeOnDisconnect);
	}

	#disconnectionController;
	disconnectedCallback() {
		this.#disconnectionController.abort('element disconnected');
	}

	static observedAttributes = ['from'];
	get from() { return this.getAttribute('from'); }
	set from(value) { this.setAttribute('from', value); }
}

if (!window.customElements.get('slug-input')) {
	window.SlugInputElement = SlugInputElement;
	window.customElements.define('slug-input', SlugInputElement);
}
