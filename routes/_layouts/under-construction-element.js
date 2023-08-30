const messageKey = 'fall-2023-under-construction-message-dismissed';
const html = String.raw;

class UnderConstructionElement extends HTMLElement {
	get dismissButton() { return this.shadowRoot.querySelector(':host > button'); }

	connectedCallback() {
		const dismissed = localStorage.getItem(messageKey) === true;

		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = html`
				<slot></slot>
				<button type="button">Dismiss message</button>
			`;
		}

		this.dismissButton.addEventListener('click', this);
	}

	handleEvent(event) {
		if (event.type === 'click' && event.currentTarget.matches('button')) {
			localStorage.setItem(messageKey, true);
		}
	}

	static define(tagName = 'under-construction') {
		if ('localStorage' in window && !window.customElements.get(tagName)) {
			window.UnderConstructionElement = this;
			window.customElements.define('under-construction', this);
		}
	}
}


UnderConstructionElement.define();
