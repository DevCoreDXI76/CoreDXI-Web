import { describe, expect, it, vi } from "vitest";

const findMany = vi.fn().mockResolvedValue([]);
vi.mock("@/lib/prisma", () => ({
  prisma: { blogPost: { findMany: (...args: unknown[]) => findMany(...args) } },
}));

const { GET } = await import("./route");

function request(query: string) {
  return new Request(`http://localhost/api/blog/search${query}`);
}

describe("GET /api/blog/search", () => {
  it("only filters by PUBLISHED status when no query/category given", async () => {
    await GET(request(""));

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED" },
      })
    );
  });

  it("adds a case-insensitive OR filter across title/excerpt/category when q is given", async () => {
    await GET(request("?q=인공지능"));

    const where = findMany.mock.calls.at(-1)![0].where;
    expect(where.status).toBe("PUBLISHED");
    expect(where.OR).toEqual([
      { title: { contains: "인공지능", mode: "insensitive" } },
      { excerpt: { contains: "인공지능", mode: "insensitive" } },
      { category: { name: { contains: "인공지능", mode: "insensitive" } } },
    ]);
  });

  it("scopes to a category slug when provided", async () => {
    await GET(request("?category=ai-news"));

    const where = findMany.mock.calls.at(-1)![0].where;
    expect(where.category).toEqual({ slug: "ai-news" });
  });

  it("returns mapped list cards as JSON", async () => {
    findMany.mockResolvedValueOnce([
      {
        slug: "post-1",
        title: "제목",
        excerpt: "요약",
        coverImageUrl: null,
        publishedAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-02"),
        category: { name: "뉴스", slug: "news" },
      },
    ]);

    const res = await GET(request("?q=제목"));
    const body = await res.json();

    expect(body.posts).toHaveLength(1);
    expect(body.posts[0]).toMatchObject({ slug: "post-1", title: "제목" });
  });
});
