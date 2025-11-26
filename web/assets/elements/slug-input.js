const html = String.raw;

export class SlugInputElement extends HTMLElement {
	static formAssociated = true;
	#internals;
	#overridden = false;

	get #inputElement() {
		return this.shadowRoot.querySelector(":host > input");
	}
	#template = html`
		<input pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$">
	`;

	connectedCallback() {
		if (!this.shadowRoot) {
			this.#internals = this.attachInternals();
			this.attachShadow({ mode: "open" });
			this.shadowRoot.innerHTML = this.#template;
			this.#inputElement.value = this.querySelector(":scope > input").value;
			this.innerHTML = "";
		}

		this.#disconnectionController = new AbortController();
		const removeOnDisconnect = { signal: this.#disconnectionController.signal };

		this.#inputElement.addEventListener("input", (event) => {
			this.#overridden = true;
			this.#internals.setFormValue(event.target.value);
		}, removeOnDisconnect);

		this.ownerDocument.getElementById(this.from)?.addEventListener(
			"input",
			(event) => {
				if (this.#overridden) return;

				this.#inputElement.value = kebabCase(event.target.value);
				this.#internals.setFormValue(this.#inputElement.value);
			},
			removeOnDisconnect,
		);
	}

	#disconnectionController;
	disconnectedCallback() {
		this.#disconnectionController.abort("element disconnected");
	}

	static observedAttributes = ["from"];
	get from() {
		return this.getAttribute("from");
	}
	set from(value) {
		this.setAttribute("from", value);
	}
}

if (!window.customElements.get("slug-input")) {
	window.SlugInputElement = SlugInputElement;
	window.customElements.define("slug-input", SlugInputElement);
}

// node_modules/just-kebab-case

var wordSeparators =
	/[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/;
var capital_plus_lower = /[A-ZÀ-Ý\u00C0-\u00D6\u00D9-\u00DD][a-zà-ÿ]/g;
var capitals = /[A-ZÀ-Ý\u00C0-\u00D6\u00D9-\u00DD]+/g;

function kebabCase(str) {
	str = str.replace(capital_plus_lower, function (match) {
		return " " + (match[0].toLowerCase() || match[0]) + match[1];
	});
	str = str.replace(capitals, function (match) {
		return " " + match.toLowerCase();
	});
	return str
		.trim()
		.split(wordSeparators)
		.join("-")
		.replace(/^-/, "")
		.replace(/-\s*$/, "");
}
