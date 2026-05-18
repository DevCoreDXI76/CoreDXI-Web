import { Node, mergeAttributes } from "@tiptap/core";

/** YouTube/Vimeo 등 임베드용 iframe 블록 */
export const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "100%" },
      height: { default: 400 },
      frameborder: { default: 0 },
      allowfullscreen: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        class: "my-4 w-full max-w-full rounded-lg aspect-video",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      }),
    ];
  },
});
