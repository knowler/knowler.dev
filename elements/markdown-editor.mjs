class MarkdownEditor extends HTMLElement {
	editor;

	get enhanceButton() { return this.querySelector(':scope > button'); }

	connectedCallback() {
		this.enhanceButton.addEventListener('click', this.enhanceEditor.bind(this));
	}

	async enhanceEditor() {
		const { createEditor } = import('lexical');

		this.editor = createEditor();
	}
}

if (!window.customElements.get('markdown-editor')) {
	window.customElements.define('markdown-editor');
}
