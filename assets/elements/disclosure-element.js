class ExpandingEventTarget extends EventTarget {
	handleEvent(event) {
		const element = event.target;
		const value = element.getAttribute("aria-expanded");
		const valueAsBoolean = value === "true" || value === "false" ? JSON.parse(value) : false;

		element.setAttribute("aria-expanded", valueAsBoolean ? "false" : "true");
	}
}

class DisclosureElement extends HTMLElement {
	static #template = document.createElement("template");

	static {
		this.#template.innerHTML = `
			<slot name="toggle"></slot>
			<slot></slot>
		`;
	}

	#expandingTargetHandler = new ExpandingEventTarget();

	get #toggleSlot() {
		return this.shadowRoot.querySelector("slot[name=toggle]");
	}

	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		this.#toggleSlot.addEventListener("click", this.#expandingTargetHandler);
	}
}
