import { unified } from "npm:unified";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import remarkDirective from "npm:remark-directive";
import rehypeHighlight from "npm:rehype-highlight";
import rehypeSlug from "npm:rehype-slug";
import rehypeStringify from "npm:rehype-stringify";
import { visit } from "npm:unist-util-visit"
import { h } from "npm:hastscript"
import { toKebabCase } from "@std/text";

export function markdownToHTML(markdown) {
	return unified()
		.use(remarkParse)
		.use(remarkDirective)
		
		// Custom directives
		.use(noteDirective)
		.use(asideDirective)
		.use(demoDirective)
		.use(detailsDirective)
		.use(figureDirective)

		.use(elementDirective)

		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeHighlight)
		.use(rehypeSlug)
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(markdown);
}

function elementDirective() {
	return function(tree) {
		visit(tree, function(node) {
			if (node.type === "textDirective" && node.name === "element") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				data.hName = "code";
				data.hProperties = {
					className: "element",
					...hast.properties,
				}
			}
		});
	}
}

function figureDirective() {
	return function(tree) {
		visit(tree, function(node) {
			if (node.type === "containerDirective" && node.name === "figure") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				data.hName = "figure";
				data.hProperties = hast.properties;
			}

			if (node.type === "leafDirective" && node.name === "figcaption") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				data.hName = "figcaption";
				data.hProperties = hast.properties;
			}
		});
	}
}

function detailsDirective() {
	return function(tree) {
		visit(tree, function(node) {
			if (node.type === "containerDirective" && node.name === "details") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				const [maybeLabel] = node.children;
				if (maybeLabel?.data?.directiveLabel) {
					const labelData = maybeLabel.data;
					const labelHast = h("summary", labelData.attributes ?? {});

					labelData.hName = "summary";
					labelData.hProperties = labelHast.properties;
				}

				data.hName = "details";
				data.hProperties = hast.properties;

				// TODO: create a summary node to prepend to the content.
				console.log(node);
			}
		});
	}
}

function noteDirective() {
	const labelsWithinNotes = new WeakSet();
	return function(tree) {
		visit(tree, function(node) {
			if (node.type === "containerDirective" && node.name === "note") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				data.hName = "aside";
				data.hProperties = { role: "note", ...hast.properties };

				const [firstChild] = node.children;

				if (firstChild.type === "paragraph") {
					const [label] = firstChild.children.filter(
						child => child.type === "textDirective" && child.name === "label",
					);
					if (label && label.children.length === 1 && label.children[0].type === "text") {
						labelsWithinNotes.add(label)

						const id = toKebabCase(label.children[0].value);
						data.hProperties.ariaLabelledBy = id;
					}
				}
			}

			if (node.type === "textDirective" && node.name === "label" && labelsWithinNotes.has(node)) {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				data.hName = "strong";
				data.hProperties = { id: toKebabCase(node.children[0].value), ...hast.properties };
			}
		});
	}
}

function asideDirective() {
	return function(tree) {
		visit(tree, function(node) {
			if (node.type === "containerDirective" && node.name === "aside") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});
				data.hName = node.name;
				data.hProperties = hast.properties;
			}
		});
	}
}

function demoDirective() {
	return function(tree) {
		visit(tree, function(node) {
			if (node.type === "leafDirective" && node.name === "demo") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				const url = new URL(`https://knowler.dev/demos/${hast.properties.id}`);

				if (hast.properties?.codepen === "") {
					url.search = "?codepen";
				}

				data.hName = "iframe";
				data.hProperties = {
					src: url.href,
					width: hast.properties.width ?? "100%",
					height: hast.properties.height ?? "300px",
				};
			}
		});
	}
}
