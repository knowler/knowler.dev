import {BaseElement} from './base-element.mjs';

export class FormField extends BaseElement {
	connectedCallback() {
		this.addEventListener('input', this.handleInput.bind(this), {
			signal: this.disconnectedSignal,
		})

		this.addEventListener('invalid', this.handleInvalid.bind(this), {
			signal: this.disconnectedSignal,
			capture: true,
		})
	}

	handleInput(event) {
	}

	handleInvalid(event) {
	}
}

window.customElements.define('form-field', FormField);
