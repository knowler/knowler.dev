import {unified} from "npm:unified";
import remarkParse from "npm:remark-parse";
import remarkRehype from "npm:remark-rehype";
import rehypeHighlight from "npm:rehype-highlight";
import rehypeStringify from "npm:rehype-stringify";

export function markdownToHTML(markdown) {
	return unified()
		.use(remarkParse)
		.use(remarkRehype, {allowDangerousHtml: true})
		.use(rehypeHighlight)
		.use(rehypeStringify, {allowDangerousHtml: true})
		.process(markdown);
}
