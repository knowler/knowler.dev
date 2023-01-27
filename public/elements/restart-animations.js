export class RestartAnimationsElement extends HTMLElement {
	#controller;

	get #buttonElement() { return this.shadowRoot.querySelector(':host > button'); }

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = `<button type="button">Restart Animations</button>`;
			this.#controller = new AbortController();
		}

		this.#buttonElement?.addEventListener(
			'click',
			this.#restartAnimations.bind(this),
			{ signal: this.#controller.signal },
		);
	}

	disconnectedCallback() {
		this.#controller.abort('element disconnected');
	}

	#restartAnimations() {
		for (const animation of this.ownerDocument.getAnimations()) {
			animation.cancel();
			animation.play();
		}
	}

	static define() {
		if (!window.customElements.get('restart-animations')) {
			window.RestartAnimationsElement = RestartAnimationsElement;
			window.customElements.define('restart-animations', RestartAnimationsElement);
		}
	}
}
