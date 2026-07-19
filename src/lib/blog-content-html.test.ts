import { describe, expect, it } from "vitest";
import {
  blogContentToHtml,
  blogContentToPlainText,
} from "./blog-content-html";
import type { TiptapBlogContent } from "@/types/blocknote";

describe("blogContentToHtml", () => {
  it("renders Tiptap headings and paragraphs", () => {
    const doc: TiptapBlogContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "소제목" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "본문 내용" }],
        },
      ],
    };

    const html = blogContentToHtml(doc);
    expect(html).toContain("<h2>소제목</h2>");
    expect(html).toContain("<p>본문 내용</p>");
  });

  it("renders Tiptap bullet lists", () => {
    const doc: TiptapBlogContent = {
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "항목 1" }] },
              ],
            },
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "항목 2" }] },
              ],
            },
          ],
        },
      ],
    };

    const html = blogContentToHtml(doc);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li><p>항목 1</p></li>");
    expect(html).toContain("<li><p>항목 2</p></li>");
  });

  it("escapes HTML in text nodes", () => {
    const doc: TiptapBlogContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "<script>alert(1)</script>" }],
        },
      ],
    };

    const html = blogContentToHtml(doc);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders Tiptap documents", () => {
    const doc: TiptapBlogContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Tiptap 본문" }],
        },
      ],
    };

    const html = blogContentToHtml(doc);
    expect(html).toContain("<p>Tiptap 본문</p>");
  });
});

describe("blogContentToPlainText", () => {
  it("strips tags and collapses whitespace", () => {
    const doc: TiptapBlogContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "첫 문장" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "둘째 문장" }],
        },
      ],
    };

    expect(blogContentToPlainText(doc)).toBe("첫 문장 둘째 문장");
  });
});
