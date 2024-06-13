import { unified } from "npm:unified";
import { toHtml } from "npm:hast-util-to-html";
import remarkStringify from "npm:remark-stringify";
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
				aside(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
				iframe(state, node) {
					const result = { type: "html", value: toHtml(node) };
					state.patch(node, result);
					return result;
				},
			},
		})
		.use(remarkReferenceLinks)
		.use(remarkStringify)
		.process(html);
}
