/* Took this from Keith Cirkel */
const css = (strings, ...expressions) => {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(String.raw({ raw: strings }, ...expressions));
	return sheet;
}

/**
 * This is a simpler version of a custom cursor element that I
 * implemented on https://wearekettle.com, except with some
 * improvements.
 */
export class CursorElement extends HTMLElement {
	static #appearanceStyleSheet = css`
		:host {
			position: fixed;
			pointer-events: none;
			z-index: calc(infinity);
			inset: 0;
			display: block;
			aspect-ratio: 1;
			block-size: 1rem;
			background-color: CanvasText;
			clip-path: circle();
			translate: calc(var(--x, -100) * 1px - 50%) calc(var(--y, -100) * 1px - 50%);
			transition: scale 0.1s ease-in-out;
		}

		:host(:--out) {
			scale: 0;
		}
	`;

	static #documentStyleSheet = css`
		@media (pointer: fine) {
			:root:has(kno-cursor:defined:not(:--out)) {
				&, :hover {
					cursor: none !important;
				}
			}
		}
	`;

	static define(tagName = "kno-cursor") {
		if (!window.customElements.get(tagName)) {
			window[this.name] = this;
			window.customElements.define(tagName, this);
			document.adoptedStyleSheets.push(this.#documentStyleSheet);
		}
	}

	#internals = this.attachInternals();
	shadowRoot = this.attachShadow({ mode: "open" });
	#coordinatesStyleSheet = css`
		:host {}
	`;

	constructor() {
		super();

		this.#internals.ariaHidden = true;

		this.shadowRoot.adoptedStyleSheets.push(
			this.constructor.#appearanceStyleSheet,
			this.#coordinatesStyleSheet,
		);
	}

	set out(flag) {
		this.#internals.states[flag ? "add" : "delete"]("--out");
	}

	connectedCallback() {
		window.addEventListener("pointermove", this);
		window.addEventListener("blur", this);
		window.addEventListener("focus", this);
		this.ownerDocument.documentElement.addEventListener("pointerleave", this);
		this.ownerDocument.documentElement.addEventListener("pointerenter", this);
		this.ownerDocument.documentElement.addEventListener("pointerover", this);
	}

	handleEvent(event) {
		switch (event.type) {
			case "pointermove":
				this.#coordinatesStyleSheet.cssRules[0].styleMap.set("--x", event.clientX);
				this.#coordinatesStyleSheet.cssRules[0].styleMap.set("--y", event.clientY);
				break;

			case "pointerover":
				this.out = event.target.matches("a, button, input, label");
				break;

			case "blur":
			case "pointerleave":
				this.out = true;
				break;

			case "focus":
			case "pointerenter":
				this.out = false;
				break;
		}
	}
}
