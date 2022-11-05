import {createEditor} from "lexical";
import {registerRichText, HeadingNode, QuoteNode} from "@lexical/rich-text";
import {CodeNode} from "@lexical/code";
import {LinkNode} from "@lexical/link";
import {ListItemNode, ListNode} from "@lexical/list";
import {$convertFromMarkdownString, $convertToMarkdownString, registerMarkdownShortcuts} from "@lexical/markdown";
import {mergeRegister} from "@lexical/utils";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";

class MarkdownEditor extends HTMLElement {
	editor = createEditor({
		nodes: [
			HeadingNode,
			QuoteNode,
			CodeNode,
			LinkNode,
			ListNode,
			ListItemNode,
		],
	});
	history = createEmptyHistoryState();

	get form() { return this.closest('form'); }
	get textarea() { return this.querySelector(':scope > textarea'); }

	constructor() {
		super();
	}

	connectedCallback() {
		this.markdown = this.textarea.textContent;
		this.fieldName = this.textarea.name;
		this.textarea.remove();

		this.contentEditable = true;
		this.editor.setRootElement(this);

		this.editor.update(() => $convertFromMarkdownString(this.markdown));

		mergeRegister(
			registerHistory(this.editor, this.history),
			registerRichText(this.editor),
			registerMarkdownShortcuts(this.editor),
		);

		this.form.addEventListener('formdata', event => {
			this.editor.update(() => {
				event.formData.set(this.fieldName, $convertToMarkdownString());
			});
		});
	}
}

if (!window.customElements.get('markdown-editor')) {
	window.customElements.define('markdown-editor', MarkdownEditor);
}