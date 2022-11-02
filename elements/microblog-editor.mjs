import { registerPlainText } from "@lexical/plain-text";
import { createEditor } from "lexical";

class MicroblogEditor extends HTMLElement {
	editor = createEditor();

	connectedCallback() {
		this.contentEditable = true;
		this.editor.setRootElement(this);

		this.removePlainTextListener = registerPlainText(this.editor);
	}

	disconnectedCallback() {
		this.removePlainTextListener();
	}
}

if (!window.customElements.get('microblog-editor')) {
	window.customElements.define('microblog-editor', MicroblogEditor);
}
