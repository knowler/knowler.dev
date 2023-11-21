const switchElementStyleSheet = new CSSStyleSheet();
const css = String.raw;

await switchElementStyleSheet.replace(css`
:host, * {
	box-sizing: border-box;
}

:host {
	display: inline-block;
}

[part="track"] {
	block-size: 1.425em;
	inline-size: 2.425em;
	padding: 0.15em;
	border-radius: 9999px;
	border: 0.0625em solid hsl(0 0% 50%);
	box-shadow: inset 0 0 0.1em hsl(0 0% 0% / 0.2);
	transition-property: background-color, border-color, box-shadow, filter;
	transition-duration: 0.2s;
	transition-timing-function: ease-in-out;

	@media (prefers-color-scheme: light) {
		background-color: hsl(0 0% 70%);
		&:hover {
			filter: brightness(0.95);
		}
	}

	@media (prefers-color-scheme: dark) {
		background-color: hsl(0 0% 30%);
		&:hover {
			filter: brightness(1.2);
		}
	}

	:host(:--checked) & {
		background-color: DodgerBlue;
		border-color: transparent;
		box-shadow: none;
	}
}

[part="thumb"] {
	border-radius: inherit;
	block-size: 1em;
	aspect-ratio: 1;
	transition-duration: 0.2s;
	transition-timing-function: ease-in-out;

	@media (prefers-reduced-motion: no-preference) {
		transition-property: translate
	}

	@media (prefers-color-scheme: light) {
		background-color: hsl(0 0% 95%);
	}

	@media (prefers-color-scheme: dark) {
		background-color: hsl(0 0% 5%);
	}

	:host(:--checked) & {
		translate: 100% 0;
	}
}
`);

class SwitchElement extends HTMLElement {
	static formAssociated = true;

	#internals;
	#controller;

	#value;
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
		this.#internals.setFormValue(value);
	}

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" });
			this.#internals = this.attachInternals();

			// Styles
			this.shadowRoot.adoptedStyleSheets = [switchElementStyleSheet];

			// Accessibility
			this.#internals.role = "switch";
			const checkedAttributeValue = this.getAttribute("checked");
			const isChecked = checkedAttributeValue === "checked" ||
				checkedAttributeValue === "";
			this.#internals.ariaChecked = JSON.stringify(isChecked);
			if (isChecked) {
				this.#internals.states.add("--checked");
				this.value = "on";
			} else {
				this.value = "off";
			}

			// Template
			this.shadowRoot.innerHTML = `
				<div part="track" tabindex="0">
					<div part="thumb"></div>
				</div>
			`;
		}

		const { signal } = this.#controller = new AbortController();

		this.addEventListener("click", this.#handleClick.bind(this), { signal });
		this.addEventListener("keydown", this.#handleKeyDown.bind(this), {
			signal,
		});
	}
	disconnectedCallback() {
		this.#controller.abort("element disconnected");
	}

	#handleClick() {
		this.toggle();
	}

	#handleKeyDown(event) {
		if (event.code === "Space") {
			event.preventDefault();
			this.toggle();
		}
	}

	toggle() {
		const isChecked = this.#internals.states.has("--checked");

		if (isChecked) {
			this.#internals.states.delete("--checked");
			this.#internals.ariaChecked = "false";
			this.value = "off";
		} else {
			this.#internals.states.add("--checked");
			this.#internals.ariaChecked = "true";
			this.value = "on";
		}
	}

	static tagName = "input-switch";
	static define() {
		if (!window.customElements.get(this.tagName)) {
			window[this.name] = this;
			window.customElements.define(this.tagName, this);
		}
	}
}

SwitchElement.define();
