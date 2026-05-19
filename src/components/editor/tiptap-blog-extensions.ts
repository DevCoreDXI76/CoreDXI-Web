import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";
import { Iframe } from "./iframe-extension";

type Options = {
  editable: boolean;
  placeholder?: string;
};

/** 블로그 본문 에디터·리더 공통 Tiptap extensions */
export function getTiptapBlogExtensions({
  editable,
  placeholder,
}: Options): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: false,
    }),
    Link.configure({
      openOnClick: !editable,
      HTMLAttributes: { class: "text-[#1E4E8C] underline" },
    }),
    Image.configure({ allowBase64: false }),
    Youtube.configure({
      width: 640,
      height: 360,
      controls: true,
      nocookie: true,
    }),
    Iframe,
  ];

  if (placeholder) {
    extensions.push(
      Placeholder.configure({
        placeholder,
      })
    );
  }

  return extensions;
}

export const TIPTAP_BLOG_EDITOR_CONTENT_CLASS =
  "min-h-[50vh] max-w-none px-1 py-2 text-gray-800 focus:outline-none [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_iframe]:my-4 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg [&_div[data-youtube-video]]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6";

export const TIPTAP_BLOG_READER_CONTENT_CLASS =
  "max-w-none text-gray-800 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_iframe]:my-6 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg [&_div[data-youtube-video]]:my-6 [&_div[data-youtube-video]]:w-full [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6";
