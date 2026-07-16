import { describe, expect, it } from "vitest";
import {
  blogContentToHtml,
  blogContentToPlainText,
} from "./blog-content-html";
import type { BlockNoteContent, TiptapBlogContent } from "@/types/blocknote";

describe("blogContentToHtml", () => {
  it("renders BlockNote paragraphs and headings", () => {
    const blocks: BlockNoteContent = [
      {
        id: "h1",
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "소제목", styles: {} }],
      },
      {
        id: "p1",
        type: "paragraph",
        content: [{ type: "text", text: "본문 내용", styles: {} }],
      },
    ];

    const html = blogContentToHtml(blocks);
    expect(html).toContain("<h2>소제목</h2>");
    expect(html).toContain("<p>본문 내용</p>");
  });

  it("renders BlockNote bullet lists", () => {
    const blocks: BlockNoteContent = [
      {
        id: "b1",
        type: "bulletListItem",
        content: [{ type: "text", text: "항목 1", styles: {} }],
      },
      {
        id: "b2",
        type: "bulletListItem",
        content: [{ type: "text", text: "항목 2", styles: {} }],
      },
    ];

    const html = blogContentToHtml(blocks);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>항목 1</li>");
    expect(html).toContain("<li>항목 2</li>");
  });

  it("escapes HTML in text nodes", () => {
    const blocks: BlockNoteContent = [
      {
        id: "p1",
        type: "paragraph",
        content: [{ type: "text", text: "<script>alert(1)</script>", styles: {} }],
      },
    ];

    const html = blogContentToHtml(blocks);
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
    const blocks: BlockNoteContent = [
      {
        id: "p1",
        type: "paragraph",
        content: [{ type: "text", text: "첫 문장", styles: {} }],
      },
      {
        id: "p2",
        type: "paragraph",
        content: [{ type: "text", text: "둘째 문장", styles: {} }],
      },
    ];

    expect(blogContentToPlainText(blocks)).toBe("첫 문장 둘째 문장");
  });
});
