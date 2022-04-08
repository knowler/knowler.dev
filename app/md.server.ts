import parseFrontMatter from "front-matter";

// Roughly based on Chance’s Markdown setup (except just the basics):
// https://github.com/chaance/chance-dot-dev-netlify/blob/f4184c087de761aede8ceb8995154fdd872377fe/app/md.server.ts

let processor;

interface ParsedMarkdown {
  attributes: Record<string, any>;
  html: string;
}

export async function parseMarkdown(contents): Promise<ParsedMarkdown> {
  if (!processor) {
    const { unified } = await import("unified");
    const { default: remarkParse } = await import("remark-parse");
    const { default: remarkRehype } = await import("remark-rehype");
    const { default: rehypeSlug } = await import("rehype-slug");
    const { default: rehypeStringify } = await import("rehype-stringify");
    processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeStringify);
  }
  const { attributes, body } = parseFrontMatter(contents);

  const html = String(await processor.process(body));

  return {
    attributes,
    html,
  };
}
