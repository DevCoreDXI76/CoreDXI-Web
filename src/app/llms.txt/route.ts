import { SITE_URL } from "@/lib/seo";

const LLMS_CONTENT = `# CoreDXI

> B2B AX·AI 전환 솔루션 — 회의·협업을 심플하게, 변화는 단단하게.

CoreDXI(코어디엑스아이)는 B2B 기업의 AX 전환을 돕는 AI 코어 파트너입니다.

## 주요 페이지

- [홈](${SITE_URL}/): 서비스 소개 및 최신 인사이트
- [회사 소개](${SITE_URL}/about): CoreDXI 비전·팀 소개
- [솔루션](${SITE_URL}/solutions): AX·AI 제품·서비스
- [성공사례](${SITE_URL}/cases): 고객 도입 사례
- [블로그](${SITE_URL}/blog): 기술 인사이트·제품 업데이트
- [문의하기](${SITE_URL}/contact): 도입 상담·견적 문의

## 검색

- 블로그 검색: ${SITE_URL}/blog?q={검색어}

## 연락처

- 이메일: contact@coredxi.com
- 문의: ${SITE_URL}/contact

## 정책

- [이용약관](${SITE_URL}/terms)
- [개인정보처리방침](${SITE_URL}/privacy)

## 크롤링

- robots.txt: ${SITE_URL}/robots.txt
- sitemap: ${SITE_URL}/sitemap.xml
`;

export async function GET() {
  return new Response(LLMS_CONTENT.trim() + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
