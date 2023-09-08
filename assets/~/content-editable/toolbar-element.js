export class ToolbarElement extends HTMLElement {
	#internals;

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.#internals = this.attachInternals();
			this.shadowRoot.innerHTML = `
				<style>
				:host {
					display: flex;
					column-gap: 0.5rem;
					border: 0.0625rem solid CanvasText;
					border-radius: 0.5rem;
					padding: 0.5rem;
				}
				</style>
				<slot></slot>
			`;
		}

		this.tabIndex = 0;
		this.#internals.role = 'toolbar';
		this.#internals.ariaOrientation = 'horizontal';

		this.addEventListener('focus', event => {
			console.log('element focused', event.target);
		});
	}

	static define(prefix = 'kno') {
		const toolbarTagName = `${prefix}-toolbar`;

		if (!window.customElements.get(toolbarTagName)) {
			window.ToolbarElement ??= this;
			window.customElements.define(toolbarTagName, this);
		}
	}
}
