/**
 * @property {HTMLFormElement | null} form
 */
class SitePreferences extends HTMLElement {
	constructor() {
		super();

		this.form = this.querySelector('form');

		if (!this.form) throw new Error('Site preferences form is missing!');

		this.form.addEventListener('submit', this.onSubmit.bind(this));
	}

	/**
	 * @param {SubmitEvent} event
	 */
	async onSubmit(event) {
		event.preventDefault();

		if (!this.form) throw new Error('Site preferences form is missing!');

		const {action, enctype, method} = this.form;

		const response = await fetch(action,
			{
				method,
				headers: {
					'Accepts': 'application/json',
					'Content-Type': enctype,
				},
			},
		);

		if (response.ok) {
			const {theme, themeUpdated} = await response.json();

			console.log(theme, themeUpdated);
		}
	}
}

window.customElements.define('site-preferences', SitePreferences);
