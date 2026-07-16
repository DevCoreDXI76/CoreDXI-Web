import type { PartialBlock } from "@blocknote/core";
import type { JSONContent } from "@tiptap/core";
import type {
  BlockNoteContent,
  BlogPostContent,
  TiptapBlogContent,
} from "@/types/blocknote";
import { isBlockNoteContent, isTiptapDocument } from "@/types/blocknote";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text);
}

type InlineNode = {
  type?: string;
  text?: string;
  href?: string;
  styles?: Record<string, boolean | string>;
  content?: InlineNode[];
};

function applyTextStyles(text: string, styles?: Record<string, boolean | string>): string {
  let result = escapeHtml(text);
  if (!styles) return result;

  if (styles.bold) result = `<strong>${result}</strong>`;
  if (styles.italic) result = `<em>${result}</em>`;
  if (styles.underline) result = `<u>${result}</u>`;
  if (styles.strike) result = `<s>${result}</s>`;
  if (styles.code) result = `<code>${result}</code>`;

  return result;
}

function renderInlineNodes(nodes: unknown): string {
  if (!Array.isArray(nodes)) return "";

  return nodes
    .map((node) => {
      if (!node || typeof node !== "object") return "";
      const inline = node as InlineNode;

      if (inline.type === "link" && inline.href) {
        const label = renderInlineNodes(inline.content ?? []);
        return `<a href="${escapeAttr(inline.href)}" rel="noopener noreferrer">${label || escapeHtml(inline.href)}</a>`;
      }

      if (typeof inline.text === "string") {
        return applyTextStyles(inline.text, inline.styles);
      }

      if (inline.content) {
        return renderInlineNodes(inline.content);
      }

      return "";
    })
    .join("");
}

function extractTextContent(content: unknown): string {
  if (Array.isArray(content)) {
    return renderInlineNodes(content);
  }
  if (typeof content === "string") {
    return escapeHtml(content);
  }
  return "";
}

function blockTextContent(block: PartialBlock): string {
  return extractTextContent(block.content);
}

function renderBlockNoteListItem(block: PartialBlock): string {
  const text = blockTextContent(block);
  const children = Array.isArray(block.children)
    ? blockNoteBlocksToHtml(block.children as BlockNoteContent)
    : "";
  return `<li>${text}${children}</li>`;
}

function renderBlockNoteBlock(block: PartialBlock): string {
  const type = String(block.type ?? "paragraph");
  const text = blockTextContent(block);
  const children = Array.isArray(block.children)
    ? blockNoteBlocksToHtml(block.children as BlockNoteContent)
    : "";

  switch (type) {
    case "heading": {
      const rawLevel = Number(
        (block.props as { level?: number } | undefined)?.level ?? 2
      );
      const level = Math.min(6, Math.max(2, rawLevel));
      return `<h${level}>${text}</h${level}>${children}`;
    }
    case "paragraph":
      return text ? `<p>${text}</p>${children}` : children;
    case "bulletListItem":
    case "numberedListItem":
    case "checkListItem":
      return renderBlockNoteListItem(block);
    case "image": {
      const props = block.props as { url?: string; caption?: string } | undefined;
      const url = props?.url?.trim();
      if (!url) return children;
      const caption = props?.caption?.trim();
      const alt = caption ?? "";
      const figcaption = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "";
      return `<figure><img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" loading="lazy" />${figcaption}</figure>${children}`;
    }
    case "codeBlock": {
      const language =
        (block.props as { language?: string } | undefined)?.language ?? "";
      const code = text || extractTextContent(block.content);
      const langAttr = language ? ` class="language-${escapeAttr(language)}"` : "";
      return `<pre><code${langAttr}>${code}</code></pre>${children}`;
    }
    case "table":
      return `<table>${children}</table>`;
    case "tableRow":
      return `<tr>${children}</tr>`;
    case "tableCell":
    case "tableHeader":
      return `<td>${text}${children}</td>`;
    default:
      return text ? `<p>${text}</p>${children}` : children;
  }
}

function blockNoteBlocksToHtml(blocks: BlockNoteContent): string {
  const parts: string[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    const type = block.type;

    if (
      type === "bulletListItem" ||
      type === "numberedListItem" ||
      type === "checkListItem"
    ) {
      const tag = type === "numberedListItem" ? "ol" : "ul";
      const items: string[] = [];

      while (index < blocks.length && blocks[index]?.type === type) {
        items.push(renderBlockNoteListItem(blocks[index]!));
        index += 1;
      }

      parts.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    parts.push(renderBlockNoteBlock(block));
    index += 1;
  }

  return parts.join("\n");
}

function tiptapNodeToHtml(node: JSONContent): string {
  const type = node.type ?? "";
  const text = node.text ? escapeHtml(node.text) : "";
  const attrs = node.attrs as Record<string, string | number | boolean | null> | undefined;

  if (node.content?.length) {
    const inner = node.content.map(tiptapNodeToHtml).join("");
    switch (type) {
      case "doc":
        return inner;
      case "paragraph":
        return `<p>${inner}</p>`;
      case "heading": {
        const level = Math.min(6, Math.max(2, Number(attrs?.level ?? 2)));
        return `<h${level}>${inner}</h${level}>`;
      }
      case "bulletList":
        return `<ul>${inner}</ul>`;
      case "orderedList":
        return `<ol>${inner}</ol>`;
      case "listItem":
        return `<li>${inner}</li>`;
      case "blockquote":
        return `<blockquote>${inner}</blockquote>`;
      case "codeBlock": {
        const language = typeof attrs?.language === "string" ? attrs.language : "";
        const langAttr = language ? ` class="language-${escapeAttr(language)}"` : "";
        return `<pre><code${langAttr}>${inner}</code></pre>`;
      }
      case "table":
        return `<table>${inner}</table>`;
      case "tableRow":
        return `<tr>${inner}</tr>`;
      case "tableHeader":
        return `<th>${inner}</th>`;
      case "tableCell":
        return `<td>${inner}</td>`;
      default:
        return inner;
    }
  }

  switch (type) {
    case "text": {
      let result = text;
      const marks = node.marks ?? [];
      for (const mark of marks) {
        if (mark.type === "bold") result = `<strong>${result}</strong>`;
        if (mark.type === "italic") result = `<em>${result}</em>`;
        if (mark.type === "underline") result = `<u>${result}</u>`;
        if (mark.type === "strike") result = `<s>${result}</s>`;
        if (mark.type === "code") result = `<code>${result}</code>`;
        if (mark.type === "link" && typeof mark.attrs?.href === "string") {
          result = `<a href="${escapeAttr(mark.attrs.href)}" rel="noopener noreferrer">${result}</a>`;
        }
      }
      return result;
    }
    case "hardBreak":
      return "<br />";
    case "horizontalRule":
      return "<hr />";
    case "image": {
      const src = typeof attrs?.src === "string" ? attrs.src : "";
      const alt = typeof attrs?.alt === "string" ? attrs.alt : "";
      if (!src) return "";
      return `<figure><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" /></figure>`;
    }
    case "youtube": {
      const src = typeof attrs?.src === "string" ? attrs.src : "";
      if (!src) return "";
      return `<p><a href="${escapeAttr(src)}" rel="noopener noreferrer">${escapeHtml(src)}</a></p>`;
    }
    default:
      return text;
  }
}

function tiptapToHtml(doc: TiptapBlogContent): string {
  return tiptapNodeToHtml(doc);
}

/** 블로그 본문 JSON을 크롤러가 읽을 수 있는 HTML 문자열로 변환합니다. */
export function blogContentToHtml(content: BlogPostContent | null): string {
  if (!content) return "";
  if (isBlockNoteContent(content)) return blockNoteBlocksToHtml(content);
  if (isTiptapDocument(content)) return tiptapToHtml(content);
  return "";
}

/** 메타 설명·스니펫용 평문 추출 */
export function blogContentToPlainText(content: BlogPostContent | null): string {
  const html = blogContentToHtml(content);
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
