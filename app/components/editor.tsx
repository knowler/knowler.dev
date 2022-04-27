import { useCallback, useEffect, useState } from "react";
import { useMatches } from "@remix-run/react";
import cx from 'classnames';
import * as Toolbar from "@radix-ui/react-toolbar";
import { ChevronLeftIcon, ChevronRightIcon, CodeIcon, FontBoldIcon, FontItalicIcon, StrikethroughIcon, UnderlineIcon } from "@radix-ui/react-icons";

import Composer from '@lexical/react/LexicalComposer';
import ContentEditable from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// Lexical plugins
import RichTextPlugin from "@lexical/react/LexicalRichTextPlugin";
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin";
import LinkPlugin from "@lexical/react/LexicalLinkPlugin";
import ListPlugin from "@lexical/react/LexicalListPlugin";
import MarkdownShortcutPlugin from "@lexical/react/LexicalMarkdownShortcutPlugin";

// Lexical Utils
import { $isHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection, CAN_REDO_COMMAND, CAN_UNDO_COMMAND, COMMAND_PRIORITY_LOW, FORMAT_TEXT_COMMAND, ParagraphNode, REDO_COMMAND, SELECTION_CHANGE_COMMAND, UNDO_COMMAND } from "lexical";
import { LinkNode } from "@lexical/link";
import { ListNode } from "@lexical/list";
import { mergeRegister } from "@lexical/utils";
import { $convertFromMarkdownString } from "@lexical/markdown";

const useContent = () => useMatches().find(match => match.id === 'routes/$page.edit')?.data.body;

const initialConfig = {
  theme: {
    text: {
      underline: 'underline',
      strikethrough: 'strikethrough',
    },
  },
  onError(error: Error) {
    throw error
  },
  nodes: [
    HeadingNode,
    ParagraphNode,
    QuoteNode,
    LinkNode,
    ListNode,
  ],
};

export default function Editor() {
  return (
    <Composer initialConfig={initialConfig}>
      <div className="editor">
        <ToolbarPlugin />
        <div className="_input-wrap">
          <RichTextPlugin
            contentEditable={<ContentEditable className="_input" />}
            placeholder={<div className="_placeholder">Write something...</div>}
          />
        </div>
        <HistoryPlugin />
        <LinkPlugin />
        <ListPlugin />
        <MarkdownShortcutPlugin />
        <LoadContentPlugin />
      </div>
    </Composer>
  );
}

function LoadContentPlugin() {
  const [editor] = useLexicalComposerContext();
  const content = useContent();

  useEffect(() => {
    editor.update(() => {
      $convertFromMarkdownString(content, editor);
    });
  }, [content, editor]);

  return null;
}

type TextFormatType = "bold" | "italic" | "underline" | "strikethrough" | "code";
type TextAlignmentType = "left" | "center" | "right";

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [textFormatting, setTextFormatting] = useState<TextFormatType[]>([]);
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(null);
  const [blockType, setBlockType] = useState("paragraph");

  useEffect(() => {
    setTextFormatting(
      Object
        .entries({
          bold: isBold,
          italic: isItalic,
          underline: isUnderline,
          strikethrough: isStrikethrough,
        })
        .flatMap(([key, value]) => value ? key as TextFormatType : [])
    );
  }, [isBold, isItalic, isUnderline, isStrikethrough]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      console.log(element.getFormat());
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType();
        setBlockType(type);
      }

      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  const handleTextFormattingChange = (values: TextFormatType[]) => {
    const nowIsBold = values.includes('bold');
    const shouldToggleBold = (!isBold && nowIsBold) || (isBold && !nowIsBold);
    const nowIsItalic = values.includes('italic');
    const shouldToggleItalic = (!isItalic && nowIsItalic) || (isItalic && !nowIsItalic);
    const nowIsUnderline = values.includes('underline');
    const shouldToggleUnderline = (!isUnderline && nowIsUnderline) || (isUnderline && !nowIsUnderline);
    const nowIsStrikethrough = values.includes('strikethrough');
    const shouldToggleStrikethrough = (!isStrikethrough && nowIsStrikethrough) || (isStrikethrough && !nowIsStrikethrough);
    const nowIsCode = values.includes('code');
    const shouldToggleCode = (!isCode && nowIsCode) || (isCode && !nowIsCode);

    if (shouldToggleBold) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'); 
    if (shouldToggleItalic) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    if (shouldToggleUnderline) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
    if (shouldToggleStrikethrough) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
    if (shouldToggleCode) editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
  }

  const textFormattingControls = [
    {
      value: 'bold',
      state: isBold,
      Icon: FontBoldIcon,
    },
    {
      value: 'italic',
      state: isItalic,
      Icon: FontItalicIcon,
    },
    {
      value: 'underline',
      state: isUnderline,
      Icon: UnderlineIcon,
    },
    {
      value: 'strikethrough',
      state: isStrikethrough,
      Icon: StrikethroughIcon,
    },
    {
      value: 'code',
      state: isCode,
      Icon: CodeIcon,
    },
  ];

  return (
    <Toolbar.Root className="toolbar _toolabr">
      <div className="_group">
        <Toolbar.Button 
          className="_button"
          disabled={!canUndo}
          onClick={() => { editor.dispatchCommand(UNDO_COMMAND); }}
          aria-label="undo"
        >
          <ChevronLeftIcon />
        </Toolbar.Button>
        <Toolbar.Button
          className="_button"
          disabled={!canRedo}
          onClick={() => { editor.dispatchCommand(REDO_COMMAND); }}
          aria-label="redo"
        >
          <ChevronRightIcon />
        </Toolbar.Button>
      </div>
      <Toolbar.ToggleGroup className="_group" type="multiple" aria-label="Text formatting" value={textFormatting} onValueChange={handleTextFormattingChange}>
        {textFormattingControls.map(control => (
          <Toolbar.ToggleItem key={control.value} value={control.value} asChild>
            <button className={cx('_button', control.state && 'is-active')} aria-label={control.value}>
              <control.Icon />
            </button>
          </Toolbar.ToggleItem>
        ))}
      </Toolbar.ToggleGroup>
    </Toolbar.Root>
  );
}
