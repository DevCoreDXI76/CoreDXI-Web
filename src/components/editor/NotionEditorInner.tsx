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
import { getImageFileFromClipboard } from "@/lib/clipboard-image";
import {
  hasMeaningfulPasteText,
  hostImagesInHtml,
  htmlContainsExternalImages,
  isImageOnlyClipboard,
} from "@/lib/paste-html-images";
import { getVideoEmbedUrl } from "@/lib/video-embed";
import {
  EMPTY_BLOG_DOC,
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
    importRemoteImage,
    editable = true,
  },
  ref
) {
  const uploadFileRef = useRef(uploadFile);
  uploadFileRef.current = uploadFile;

  const importRemoteImageRef = useRef(importRemoteImage);
  importRemoteImageRef.current = importRemoteImage;

  const imageUploadingRef = useRef(false);
  const [imageUploading, setImageUploading] = useState(false);

  const processImageUploadRef = useRef<
    (file: File, onSuccess: (url: string) => void) => void
  >(() => {});

  const emitDocumentChangeRef = useRef<() => void>(() => {});

  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  processImageUploadRef.current = (file, onSuccess) => {
    if (!uploadFileRef.current || imageUploadingRef.current) return;
    imageUploadingRef.current = true;
    setImageUploading(true);
    void uploadFileRef
      .current(file)
      .then(onSuccess)
      .catch((err: unknown) => {
        console.error("[NotionEditor] image upload failed", err);
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
    // storageKey(글 ID)가 바뀔 때만 본문 초기화 — refresh 시 편집 중 내용이 덮이지 않도록
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageKey]
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          link: false,
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
            emitDocumentChangeRef.current();
          });
          return true;
        },
        handlePaste: (view, event) => {
          const clipboard = event.clipboardData;
          if (!clipboard || !uploadFileRef.current) return false;

          const ed = editorRef.current;
          if (!ed) return false;

          const html = clipboard.getData("text/html");
          const plain = clipboard.getData("text/plain");
          const upload = uploadFileRef.current;
          const importRemote = importRemoteImageRef.current;

          const beginPasteWork = () => {
            imageUploadingRef.current = true;
            setImageUploading(true);
          };
          const endPasteWork = () => {
            imageUploadingRef.current = false;
            setImageUploading(false);
          };

          const insertProcessedHtml = (processedHtml: string) => {
            ed.chain().focus().insertContent(processedHtml).run();
            emitDocumentChangeRef.current();
          };

          const pasteHtmlWithHostedImages = (rawHtml: string) => {
            if (!importRemote) {
              insertProcessedHtml(rawHtml);
              return;
            }
            beginPasteWork();
            void hostImagesInHtml(rawHtml, {
              uploadFile: upload,
              importRemote,
            })
              .then(insertProcessedHtml)
              .catch((err: unknown) => {
                console.error("[NotionEditor] paste html with images failed", err);
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "붙여넣기 중 일부 이미지를 올리지 못했습니다."
                );
                insertProcessedHtml(rawHtml);
              })
              .finally(endPasteWork);
          };

          // 텍스트+이미지 등 풍부한 HTML — 본문 전체 붙여넣기 후 이미지 URL 치환
          if (html && hasMeaningfulPasteText(html, plain)) {
            event.preventDefault();
            if (htmlContainsExternalImages(html)) {
              pasteHtmlWithHostedImages(html);
            } else {
              insertProcessedHtml(html);
            }
            return true;
          }

          // 이미지만 있는 HTML (여러 장 포함)
          if (html?.includes("<img") && htmlContainsExternalImages(html)) {
            event.preventDefault();
            pasteHtmlWithHostedImages(html);
            return true;
          }

          // 스크린샷·이미지 파일만
          const clipFile = getImageFileFromClipboard(clipboard);
          if (clipFile && isImageOnlyClipboard(clipboard)) {
            event.preventDefault();
            processImageUploadRef.current(clipFile, (url) => {
              ed.chain().focus().setImage({ src: url }).run();
              emitDocumentChangeRef.current();
            });
            return true;
          }

          return false;
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChangeDocument?.(ed.getJSON() as TiptapBlogContent);
      },
    },
    [storageKey]
  );

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    emitDocumentChangeRef.current = () => {
      if (!editor) return;
      onChangeDocument?.(editor.getJSON() as TiptapBlogContent);
    };
  }, [editor, onChangeDocument]);

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
        emitDocumentChangeRef.current();
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
