import { unified } from "npm:unified";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import remarkDirective from "npm:remark-directive";
import rehypeHighlight from "npm:rehype-highlight";
import rehypeSlug from "npm:rehype-slug";
import rehypeStringify from "npm:rehype-stringify";
import {visit} from "npm:unist-util-visit"
import {h} from "npm:hastscript"
import { toKebabCase } from "@std/text";

export function markdownToHTML(markdown) {
	return unified()
		.use(remarkParse)
		.use(remarkDirective)
		.use(noteDirective)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeHighlight)
		.use(rehypeSlug)
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(markdown);
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

			if (node.type === "containerDirective" && node.name === "aside") {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});
				data.hName = node.name;
				data.hProperties = hast.properties;
			}

			if (node.type === "textDirective" && node.name === "label" && labelsWithinNotes.has(node)) {
				const data = node.data || (node.data = {});
				const hast = h(node.name, node.attributes ?? {});

				data.hName = "strong";
				data.hProperties = { id: toKebabCase(node.children[0].value), ...hast.properties };
			}

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
