import type { EditorState, LexicalNode } from 'lexical';
import { $isTextNode } from 'lexical';
import { $isLineBreakNode } from 'lexical';
import { $isParagraphNode } from 'lexical';
import { $getRoot } from 'lexical';
import { $createLineBreakNode, $createParagraphNode, $createTextNode } from 'lexical';
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { $createLinkNode, $isLinkNode } from '@lexical/link';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { $createCodeHighlightNode, $createCodeNode, $isCodeNode } from '@lexical/code';
import { brk, emphasis, heading, link, paragraph, root, strong, text } from 'mdast-builder';

const textFormats = {
  strong: 1,
  emphasis: 2,
}

export function mdastNodeToLexical(mdastNode) {
  switch (mdastNode.type) {

    case 'root':
      return mdastNode.children.map(mdastNodeToLexical);

    case 'heading':
      const heading = $createHeadingNode(`h${mdastNode.depth}`);
      if (mdastNode.children) heading.append(...mdastNode.children.map(mdastNodeToLexical));
      return heading;

    case 'paragraph':
      const paragraph = $createParagraphNode();
      if (mdastNode.children) paragraph.append(...mdastNode.children.map(mdastNodeToLexical));
      return paragraph;

    case 'link':
      return $createLinkNode(mdastNode.url).append(
        ...mdastNode.children.map(mdastNodeToLexical)
      );

    case 'list':
      return $createListNode(mdastNode.ordered ? 'ol' : 'ul').append(
        ...mdastNode.children.map(mdastNodeToLexical)
      );

    case 'listItem':
      return $createListItemNode().append(
        ...mdastNode.children.map(mdastNodeToLexical)
      );

    case 'text': return $createTextNode(mdastNode.value.replaceAll("\n", ' '));

    case 'code': 
      const lines = mdastNode.value.split('\n');
      return $createCodeNode().append(
        ...lines.flatMap((line, index) => {
          const codeHighlightNode = $createCodeHighlightNode(line, mdastNode.lang);
          return lines.length - 1 > index
            ? [codeHighlightNode, $createLineBreakNode()]
            : codeHighlightNode;
        })
      );

    case 'strong':
    case 'emphasis':
      const text = $createTextNode(mdastNode.children[0].value);
      text.setFormat(textFormats[mdastNode.type]);
      return text;

    case 'inlineCode':
      const inlineCode = $createTextNode(mdastNode.value);
      inlineCode.setFormat(16);
      return inlineCode;

    case 'break': return $createLineBreakNode();

    default:
      throw `Unhandled mdast type: ${mdastNode.type}`;
  }
}

function lexicalNodeToMdast(node: LexicalNode) {

  if ($isHeadingNode(node)) {
    return heading(
      Number(node.getTag().replace('h', '')),
      node.getChildren().flatMap(lexicalNodeToMdast)
    );
  }

  if ($isTextNode(node)) {
    const isBold = node.hasFormat('bold');
    const isItalic = node.hasFormat('italic');

    const textNode = text(node.getTextContent());

    if (isBold && isItalic) return strong(emphasis(textNode));

    if (isBold) return strong(textNode);
    if (isItalic) return emphasis(textNode)

    return textNode;
  }

  if ($isLinkNode(node)) {
    return link(
      node.getURL(),
      undefined,
      node.getChildren().flatMap(lexicalNodeToMdast)
    );
  }

  if ($isParagraphNode(node)) return paragraph(node.getChildren().flatMap(lexicalNodeToMdast));
  if ($isLineBreakNode(node)) return brk;

  return [];
}

export function lexicalToMarkdown() {
  const mdastRoot = root();
  for (const child of $getRoot().getChildren()) {
    mdastRoot.children.push(lexicalNodeToMdast(child));
  }
  console.log(mdastRoot);
  return mdastRoot;
}
