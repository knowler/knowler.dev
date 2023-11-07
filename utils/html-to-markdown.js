import {unified} from "npm:unified";
import {toHtml} from "npm:hast-util-to-html"
import remarkStringify from "npm:remark-stringify";
import rehypeParse from "npm:rehype-parse";
import rehypeRemark from "npm:rehype-remark";

export function htmlToMarkdown(html) {
	return unified()
		.use(rehypeParse)
		.use(rehypeRemark, {
			handlers: {
				small(state, node) {
					const result = {type: "html", value: toHtml(node)};
					state.patch(node, result);
					return result;
				},
			},
		})
		.use(remarkStringify)
		.process(html);
}
