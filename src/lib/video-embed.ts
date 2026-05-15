/**
 * YouTube / Vimeo watch URL → embed iframe URL
 */
export function getVideoEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // youtube.com/watch?v=VIDEO_ID or /embed/VIDEO_ID
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "m.youtube.com"
    ) {
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube.com${parsed.pathname}`;
      }
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const shorts = parsed.pathname.match(/^\/shorts\/([^/]+)/);
      if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;
    }

    // vimeo.com/123456789
    if (
      parsed.hostname === "vimeo.com" ||
      parsed.hostname === "www.vimeo.com"
    ) {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      return id && /^\d+$/.test(id)
        ? `https://player.vimeo.com/video/${id}`
        : null;
    }

    // player.vimeo.com/video/123456789
    if (parsed.hostname === "player.vimeo.com") {
      const match = parsed.pathname.match(/^\/video\/(\d+)/);
      if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch {
    return null;
  }

  return null;
}
