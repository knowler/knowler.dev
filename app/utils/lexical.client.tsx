import {useEffect, useRef} from 'react';
import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mdastNodeToLexical, lexicalToMarkdown} from './lexical-mdast';
import {fromMarkdown} from 'mdast-util-from-markdown';
import {toMarkdown} from 'mdast-util-to-markdown';

export const createInitialContentSetter = (content: string) => () => {
  $getRoot().append(...mdastNodeToLexical(fromMarkdown(content)));
}

export function PersistenceInput() {
  const inputRef = useRef();
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const markdown = toMarkdown(lexicalToMarkdown());
        inputRef.current.value = markdown;
      });
    });
  }, [editor]);

  return <input ref={inputRef} type="hidden" name="content" />;
}
