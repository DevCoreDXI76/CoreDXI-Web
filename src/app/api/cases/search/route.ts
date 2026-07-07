import { NextResponse } from "next/server";
import { getPortfolios } from "@/lib/portfolio";

/** 성공사례 업종·솔루션 유형 필터 검색 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry")?.trim() || undefined;
  const solutionType = searchParams.get("solutionType")?.trim() || undefined;

  const items = await getPortfolios({ industry, solutionType });

  return NextResponse.json({ items });
}
