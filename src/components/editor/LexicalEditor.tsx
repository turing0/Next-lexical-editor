"use client";

import { useEffect, useState } from "react";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LexicalComposer } from "@lexical/react/LexicalComposer";

import {
  SharedHistoryContext,
  useSharedHistoryContext,
} from "./context/SharedHistoryContext";
import { SharedAutocompleteContext } from "./context/SharedAutocompleteContext";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";

// editor

import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import { KeywordNode } from "./nodes/KeywordNode";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import LexicalAutoLinkPlugin from "./plugins/AutoLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import CodeActionMenuPlugin from "./plugins/CodeActionMenuPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import ModalProvider from "./hooks/useModal";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

import ImagesPlugin from "./plugins/ImagesPlugin";
import { ImageNode } from "./nodes/ImageNode";
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin";
import { ExcalidrawNode } from "./nodes/ExcalidrawNode";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import TableCellResizerPlugin from "./plugins/TableCellResizer";
import TableHoverActionsPlugin from "./plugins/TableHoverActionsPlugin";
import { LayoutContainerNode } from "./nodes/LayoutContainerNode";
import { LayoutItemNode } from "./nodes/LayoutItemNode";
import { LayoutPlugin } from "./plugins/LayoutPlugin/LayoutPlugin";
import AutocompletePlugin from "./plugins/AutocompletePlugin";
import { AutocompleteNode } from "./nodes/AutocompleteNode";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import { CollapsibleContainerNode } from "./plugins/CollapsiblePlugin/CollapsibleContainerNode";
import { CollapsibleContentNode } from "./plugins/CollapsiblePlugin/CollapsibleContentNode";
import { CollapsibleTitleNode } from "./plugins/CollapsiblePlugin/CollapsibleTitleNode";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";

import dynamic from "next/dynamic";
import { EditorState } from "lexical";
import { OnChangePlugin } from "./plugins/OnChangePlugin";
import { Loader2 } from "lucide-react";

const ToolbarPlugin = dynamic(() => import("./plugins/ToolbarPlugin"), {
  ssr: false,
});
const DraggableBlockPlugin = dynamic(
  () => import("./plugins/DraggableBlockPlugin"),
  { ssr: false }
);
const FloatingLinkEditorPlugin = dynamic(
  () => import("./plugins/FloatingLinkEditorPlugin"),
  { ssr: false }
);
const TableCellActionMenuPlugin = dynamic(
  () => import("./plugins/TableActionMenuPlugin"),
  { ssr: false }
);
const FloatingTextFormatToolbarPlugin = dynamic(
  () => import("./plugins/FloatingTextFormatToolbarPlugin"),
  { ssr: false }
);
const ComponentPickerMenuPlugin = dynamic(
  () => import("./plugins/ComponentPickerPlugin"),
  { ssr: false }
);
const PlaygroundNodes = [
  HeadingNode,
  QuoteNode,
  CodeNode,
  ListNode,
  ListItemNode,
  LinkNode,
  HorizontalRuleNode,
  CodeHighlightNode,
  AutoLinkNode,
  HorizontalRuleNode,
  KeywordNode,
  ImageNode,
  ExcalidrawNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LayoutContainerNode,
  LayoutItemNode,
  AutocompleteNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
];

export default function LexicalEditor({
  initialEditorState,
  SavelocalStorage=true,
  loadFromLocalStorage
}: {
  initialEditorState?: any;
  SavelocalStorage:boolean
  loadFromLocalStorage?:boolean
}) {
  
  function Load() {
    if (typeof window !== "undefined" && loadFromLocalStorage) {
      const data = localStorage.getItem("editorState");
      return data;
    } else {
      return initialEditorState;
    }
  }
  
  const initialConfig = {
    namespace: "Editor",
    nodes: [...PlaygroundNodes],
    editable: true,
    editorState: Load(),
    onError: (error: Error) => {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <SharedAutocompleteContext>
          <ModalProvider>
            <Editor SavelocalStorage={SavelocalStorage}/>
          </ModalProvider>
        </SharedAutocompleteContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}


const placeholder =
  "Write something, or press `space` for AI, `/` for commands";

function Editor({SavelocalStorage}:{SavelocalStorage:boolean}) {
  const isEditable = useLexicalEditable();
  const { historyState } = useSharedHistoryContext();
  const [floatingAnchorElem, setFloatingAnchorElem]=useState<HTMLDivElement | null>(null);
  const [editorState, setEditorState] = useState<EditorState>();
  const [Loading,setLoading]=useState(false)

  function Save(){
    console.log("save to db")
    // save it database
  }

  function onChange(editorState: EditorState) {
    setLoading(true)
    if(SavelocalStorage){
      const json = JSON.stringify(editorState);
      localStorage.setItem('editorState', json)
    }else{
      setEditorState(editorState);
    }
    setLoading(false)

  }

  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isAuthorFocused, setIsAuthorFocused] = useState(false);

  return (
    <div className="w-full min-h-screen h-full">
      {/* <div className="flex flex-row items-center m-x-4 w-full pt-6">
        {Loading && <Loader2 className="animate-spin h-5 w-5"/>}
        <Button className="rounded-3xl h-7" onClick={Save}>
          PUBLISH
        </Button>
      </div> */}

      {/* title */}
      <div className="mt-6 p-1">
        <div className="relative">
          {isFocused && (
            <span className="absolute left-0 top-1/2 -translate-x-[calc(100%+16px)] -translate-y-1/2 text-gray-400 text-3xl font-medium leading-normal">
              Title
            </span>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setIsFocused(e.target.value.length > 0)
            }}
            placeholder="Title"
            // onFocus={() => setIsFocused(true)}
            onFocus={() => {
              setIsFocused(title.length > 0)
              setIsAuthorFocused(author.length > 0)
            }}
            onBlur={() => {
              setIsFocused(false)
              setIsAuthorFocused(false)
            }}
            className="w-full text-3xl font-medium outline-none border-none placeholder:text-gray-400"
          />
        </div>
        <div className="relative">
          {isAuthorFocused && (
            <span className="absolute left-0 top-1/2 -translate-x-[calc(100%+16px)] -translate-y-1/2 text-gray-400 text-base font-normal leading-normal">
              Author
            </span>
          )}
          <input
            type="text"
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value)
              setIsAuthorFocused(e.target.value.length > 0)
            }}
            placeholder="Author"
            onFocus={() => {
              setIsAuthorFocused(author.length > 0)
              setIsFocused(title.length > 0)
            }}
            onBlur={() => {
              setIsAuthorFocused(false)
              setIsFocused(false)
            }}
            className="w-full text-base font-normal outline-none border-none text-gray-400"
          />
        </div>
      </div>

      {/* {isEditable && <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />} */}
      <div className="relative">
        <HistoryPlugin externalHistoryState={historyState} />
        <RichTextPlugin
          contentEditable={
            <div ref={onRef} className="overflow-x-hidden">
              <ContentEditable autoFocus={true} className="editor-input p-4" />
            </div>
          }
          placeholder={<div className="editor-placeholder">{placeholder}</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <OnChangePlugin onChange={onChange} />
      <DragDropPaste />
      <TabFocusPlugin />
      <TabIndentationPlugin />
      <LexicalAutoLinkPlugin />
      <ClickableLinkPlugin disabled={isEditable} />
      <AutoFocusPlugin />
      <ListPlugin />
      <LinkPlugin />
      <HorizontalRulePlugin />
      <ImagesPlugin />
      <ExcalidrawPlugin />
      <LayoutPlugin />
      <AutocompletePlugin />
      <CheckListPlugin />
      <ClearEditorPlugin />
      <ListMaxIndentLevelPlugin maxDepth={7} />
      <CodeHighlightPlugin />
      <MarkdownShortcutPlugin />
      <KeywordsPlugin />
      <TablePlugin />

      {isEditable && <ComponentPickerMenuPlugin />}
      <TableCellResizerPlugin />
      <TableHoverActionsPlugin />
      <CollapsiblePlugin />
      {isEditable && floatingAnchorElem && (
        <>
          <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
          <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
          <FloatingLinkEditorPlugin
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
          <TableCellActionMenuPlugin
            anchorElem={floatingAnchorElem}
            cellMerge={true}
          />
          <FloatingTextFormatToolbarPlugin
            anchorElem={floatingAnchorElem}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        </>
      )}
      <TableOfContentsPlugin />
    </div>
  );
}
