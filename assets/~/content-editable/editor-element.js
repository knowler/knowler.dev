const commands = [
	"Alt",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"Backspace",
	"CapsLock",
	"Control",
	"Dead",
	"Delete",
	"DownUp",
	"End",
	"Enter",
	"Escape",
	"F1",
	"F10",
	"F11",
	"F12",
	"F2",
	"F3",
	"F4",
	"F5",
	"F6",
	"F7",
	"F8",
	"F9",
	"Home",
	"Meta",
	"PageUp",
	"Shift",
	"Tab",
];

export class EditorElement extends HTMLElement {
	static formAssociated = true;

	#disconnectController;
	#internals;

	#formattingState = {
		bold: false,
		italic: false,
		underline: false,
	};

	connectedCallback() {
		const { signal } = this.#disconnectController = new AbortController();
		if (!this.shadowRoot) {
			//this.attachShadow({mode: "open"});
			//this.shadowRoot.innerHTML = `
			//	<style>
			//	:host {
			//		font-family: system-ui;
			//		display: block;
			//		padding: 1rem;
			//		border-radius: 0.5rem;
			//		border: 0.0625rem solid CanvasText;
			//	}
			//	</style>
			//	<slot></slot>
			//`;
			this.#internals ??= this.attachInternals();
		}

		this.contentEditable = "true";
		this.#internals.role = "textbox";
		this.#internals.ariaMultiline = "true";

		this.addEventListener("keydown", this.handleKeyDown.bind(this), { signal });
	}

	disconnectedCallback() {
		this.#disconnectController.abort("element was removed");
	}

	handleKeyDown(event) {
		const selection = window.getSelection();
		const hasModifier = event.altKey || event.ctrlKey || event.metaKey;

		if (!hasModifier && !commands.includes(event.key)) {
			console.log(event.key);
			if (this.#formattingState.bold) {
				if (selection.type === "Caret") {
					const { focusNode, focusOffset } = selection;
					if (
						focusNode.length === focusOffset &&
						focusNode.parentElement?.localName !== "strong"
					) {
						event.preventDefault();
						const strongElement = this.ownerDocument.createElement("strong");
						const newText = this.ownerDocument.createTextNode(event.key);
						strongElement.append(newText);
						focusNode.after(strongElement);
						selection.modify("move", "forward", "character");
					}
				}
			}
		}

		switch (event.key) {
			case "b": {
				if (
					event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey
				) {
					event.preventDefault();
					if (window.getSelection().type === "Caret") {
						this.#formattingState.bold = !this.#formattingState.bold;
					}
					break;
				}
				break;
			}
			case "Enter": {
				if (!hasModifier && !event.shiftKey && selection.type === "Caret") {
					event.preventDefault();
					const selection = window.getSelection();
					const selectionRange = selection.getRangeAt(0);
					console.log(selectionRange);

					const headNode = selectionRange.startContainer;
					const tailNode = headNode.splitText(selectionRange.startOffset);

					const newParagraph = document.createElement("p");
					newParagraph.append(tailNode);
					headNode.parentNode.after(newParagraph);
					selection.removeAllRanges();
					const newSelectionRange = document.createRange();
					newSelectionRange.setStartBefore(tailNode);
					newSelectionRange.setEndBefore(tailNode);
					newSelectionRange.collapse();
					selection.addRange(newSelectionRange);
				}
				break;
			}
			// Delete backward
			case "Backspace": {
				const selection = window.getSelection();

				if (selection.type === "Caret") {
					const { focusNode, focusOffset } = selection;

					if (
						focusNode instanceof Text && focusNode.length === 1 &&
						focusOffset === 1
					) {
						console.log("Last letter");
						event.preventDefault();
						if (
							focusNode.parentNode.childNodes.length === 1 &&
							!focusNode.parentElement.matches(":only-child")
						) focusNode.parentNode.remove();
						else focusNode.remove();
					} else if (
						focusNode instanceof Element && focusNode.matches(":only-child")
					) {
						event.preventDefault();
					}
				}

				break;
			}
			// Delete forward
			case "Delete": {
				break;
			}
		}
	}

	static define(prefix = "kno") {
		this.prefix = prefix;
		const editorTagName = `${prefix}-editor`;

		if (!window.customElements.get(editorTagName)) {
			window.EditorElement = this;
			window.customElements.define(editorTagName, this);
		}
	}
}
