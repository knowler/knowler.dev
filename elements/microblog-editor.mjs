class MicroblogEditor extends HTMLElement {
	connectedCallback() {
		console.log('Hello, World!');
	}
}

if (!window.customElements.get('microblog-editor')) {
	window.customElements.define('microblog-editor', MicroblogEditor);
}
