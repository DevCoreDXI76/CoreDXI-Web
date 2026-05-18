"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { getVideoEmbedUrl } from "@/lib/video-embed";
import {
  EMPTY_BLOG_DOC,
  isTiptapDocument,
  normalizeBlogContent,
  type TiptapBlogContent,
} from "@/types/blocknote";
import { Iframe } from "./iframe-extension";
import type { NotionEditorHandle, NotionEditorProps } from "./notion-editor-types";

/** Tiptap 블로그 에디터 — 프로덕션 BlockNote renderSpec 이슈 회피 */
export const NotionEditorInner = forwardRef<
  NotionEditorHandle,
  NotionEditorProps
>(function NotionEditorInner(
  {
    storageKey = "default",
    initialContent,
    onChangeDocument,
    uploadFile,
    editable = true,
  },
  ref
) {
  const uploadFileRef = useRef(uploadFile);
  uploadFileRef.current = uploadFile;

  const imageUploadingRef = useRef(false);
  const [imageUploading, setImageUploading] = useState(false);

  const processImageUploadRef = useRef<
    (file: File, onSuccess: (url: string) => void) => void
  >(() => {});

  processImageUploadRef.current = (file, onSuccess) => {
    if (!uploadFileRef.current || imageUploadingRef.current) return;
    imageUploadingRef.current = true;
    setImageUploading(true);
    void uploadFileRef
      .current(file)
      .then(onSuccess)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.";
        toast.error(message);
      })
      .finally(() => {
        imageUploadingRef.current = false;
        setImageUploading(false);
      });
  };

  const initialDoc = useMemo(
    () => normalizeBlogContent(initialContent),
    [initialContent]
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Link.configure({
          openOnClick: !editable,
          HTMLAttributes: { class: "text-[#1E4E8C] underline" },
        }),
        Image.configure({ allowBase64: false }),
        Iframe,
        Placeholder.configure({
          placeholder: "본문을 입력하세요…",
        }),
      ],
      content: initialDoc,
      editable,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "min-h-[50vh] max-w-none px-1 py-2 text-gray-800 focus:outline-none [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_iframe]:my-4 [&_iframe]:aspect-video [&_img]:max-w-full [&_img]:rounded-lg [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
        },
        handleDrop: (view, event) => {
          const file = event.dataTransfer?.files?.[0];
          if (!file?.type.startsWith("image/") || !uploadFileRef.current) {
            return false;
          }
          event.preventDefault();
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          processImageUploadRef.current(file, (url) => {
            const { schema } = view.state;
            const node = schema.nodes.image?.create({ src: url });
            if (!node || !coordinates) return;
            const transaction = view.state.tr.insert(coordinates.pos, node);
            view.dispatch(transaction);
          });
          return true;
        },
        handlePaste: (view, event) => {
          const file = event.clipboardData?.files?.[0];
          if (!file?.type.startsWith("image/") || !uploadFileRef.current) {
            return false;
          }
          event.preventDefault();
          processImageUploadRef.current(file, (url) => {
            view.dispatch(
              view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image!.create({ src: url })
              )
            );
          });
          return true;
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChangeDocument?.(ed.getJSON() as TiptapBlogContent);
      },
    },
    [storageKey]
  );

  useEffect(() => {
    if (!editor) return;
    const doc = isTiptapDocument(initialContent)
      ? initialContent
      : EMPTY_BLOG_DOC;
    editor.commands.setContent(doc, { emitUpdate: false });
  }, [editor, storageKey, initialContent]);

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editor, editable]);

  useImperativeHandle(
    ref,
    () => ({
      getDocument: () =>
        (editor?.getJSON() as TiptapBlogContent) ?? EMPTY_BLOG_DOC,
    }),
    [editor]
  );

  const insertImage = useCallback(() => {
    if (!editor || !uploadFileRef.current || imageUploadingRef.current) {
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      processImageUploadRef.current(file, (url) => {
        editor.chain().focus().setImage({ src: url }).run();
      });
    };
    input.click();
  }, [editor]);

  const insertYoutube = useCallback(() => {
    if (!editor || imageUploadingRef.current) return;
    const raw = window.prompt("YouTube URL을 입력하세요");
    if (!raw?.trim()) return;
    const embedUrl = getVideoEmbedUrl(raw);
    if (!embedUrl) {
      toast.error("유효한 YouTube 링크가 아닙니다.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "iframe",
        attrs: { src: embedUrl, width: "100%", height: 400 },
      })
      .run();
  }, [editor]);

  const toolbarDisabled = imageUploading;

  if (!editor) {
    return <EditorLoadingPlaceholder />;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {editable && uploadFile ? (
        <div className="flex flex-wrap gap-1 border-b border-gray-100 px-2 py-2">
          <ToolbarButton
            label="굵게"
            disabled={toolbarDisabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="기울임"
            disabled={toolbarDisabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="H2"
            disabled={toolbarDisabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolbarButton
            label="목록"
            disabled={toolbarDisabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label={imageUploading ? "업로드 중…" : "이미지"}
            disabled={toolbarDisabled}
            onClick={insertImage}
          />
          <ToolbarButton
            label="YouTube 동영상"
            disabled={toolbarDisabled}
            onClick={insertYoutube}
          />
        </div>
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
});

function ToolbarButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}

function EditorLoadingPlaceholder() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
      에디터를 불러오는 중입니다…
    </div>
  );
}
