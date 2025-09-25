import { unified } from "npm:unified";
import { toHtml } from "npm:hast-util-to-html";
import { toMdast } from "npm:hast-util-to-mdast";
import { toText } from "npm:hast-util-to-text";
import remarkStringify from "npm:remark-stringify";
import remarkDirective from "npm:remark-directive";
import remarkReferenceLinks from "npm:remark-reference-links";
import rehypeParse from "npm:rehype-parse";
import rehypeRemark from "npm:rehype-remark";

export function htmlToMarkdown(html) {
	return unified()
		.use(rehypeParse)
		.use(rehypeRemark, {
			handlers: {
				abbr(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
				dfn(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
				i(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
				b(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
				small(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
				time(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
				aside(state, node) {
					let result;
					if (node.properties.role === "note") {
						const { role, ariaLabelledBy, ...attributes } = node.properties;
						const [labelId] = ariaLabelledBy;
						result = {
							name: "note",
							type: "containerDirective",
							attributes,
							children: toMdast({ type: "root", children: node.children }, {
								handlers: {
									...state.options.handlers,
									strong(state, node) {
										if (node.properties?.id === labelId) {
											const { id, ...attributes } = node.properties;
											const result = {
												name: "label",
												type: "textDirective",
												attributes,
												children: [
													{ type: "text", value: toText({ type: "root", children: node.children }) },
												],
											};
											state.patch(node, result);
											return result;
										}
									},
								},
							}).children,
						};
						state.patch(node, result);
					} else {
						result = { type: "html", value: toHtml(node) };
						state.patch(node, result);
					}
					return result;
				},
				iframe(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
			},
		})
		.use(remarkDirective)
		.use(remarkReferenceLinks)
		.use(remarkStringify)
		.process(html);
}
