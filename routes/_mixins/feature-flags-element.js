customElements.define("feature-flags", class extends HTMLElement {
	static #styleSheet = new CSSStyleSheet();
	static #template = document.createElement("template");

	static {
		this.#template.innerHTML = `
			<slot name="toggle"></slot>
			<slot name="dialog"></slot>
		`;
		const css = String.raw;
		this.#styleSheet.replaceSync(css`
			:host {
				display: block;
				margin-block-start: 1rem;
			}
		`);
	}

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [this.constructor.#styleSheet];
		this.shadowRoot.appendChild(this.constructor.#template.content.cloneNode(true));

		this.shadowRoot.querySelector("slot[name=toggle]").addEventListener("click", this);
	}

	handleEvent(event) {
		if (event.type === "click") {
			const [dialog] = this.shadowRoot.querySelector("slot[name=dialog]").assignedElements();
			dialog.showModal();
		}
	}
});
