import { describe, expect, it, vi } from "vitest";

const getPortfoliosMock = vi.fn().mockResolvedValue([]);
vi.mock("@/lib/portfolio", () => ({
  getPortfolios: (...args: unknown[]) => getPortfoliosMock(...args),
}));

const { GET } = await import("./route");

function request(query: string) {
  return new Request(`http://localhost/api/cases/search${query}`);
}

describe("GET /api/cases/search", () => {
  it("calls getPortfolios with no filter when no params given", async () => {
    await GET(request(""));
    expect(getPortfoliosMock).toHaveBeenCalledWith({
      industry: undefined,
      solutionType: undefined,
    });
  });

  it("passes industry and solutionType filters through", async () => {
    await GET(request("?industry=제조&solutionType=AX 전환 컨설팅"));
    expect(getPortfoliosMock).toHaveBeenCalledWith({
      industry: "제조",
      solutionType: "AX 전환 컨설팅",
    });
  });

  it("returns items as JSON", async () => {
    getPortfoliosMock.mockResolvedValueOnce([{ id: "1", title: "사례" }]);
    const res = await GET(request(""));
    const body = await res.json();
    expect(body.items).toEqual([{ id: "1", title: "사례" }]);
  });
});
