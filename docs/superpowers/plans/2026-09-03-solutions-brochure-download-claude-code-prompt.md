# Claude Code 실행 프롬프트 — 소개서 v3 S3·S4 게시 (`/solutions` 다운로드 버튼)

작성일: 2026-09-03 · 상위 플랜: `docs/superpowers/plans/2026-08-30-ax-consulting-brochure-action-plan.md` S3~S4 · 소개서 v3는 2026-09-03 사용자 최종 확정(S2 종료)

> 아래 구분선 이후 전체를 Claude Code에 그대로 붙여 넣는다. S3-1(PDF 내보내기)만 사용자가 Windows PowerPoint에서 먼저 수행한다.

---

## 사전 작업 (사용자, Claude Code 실행 전)

1. `docs/superpowers/assets/brochure/20260901_제안서_사내_AX전환컨설팅소개서_v3.pptx`를 PowerPoint로 열어 **파일 → 내보내기 → PDF/XPS 문서 만들기**(옵션: 표준 품질, "문서 속성" 포함)로 내보낸다.
2. 저장 위치·이름: `public/docs/coredxi-ax-consulting-brochure.pdf` (폴더 `public/docs/`는 새로 만든다. 파일명에 버전 없음 — URL 고정 결정).
3. 파일 크기가 2MB를 넘으면 "최소 크기(온라인 게시)"로 다시 내보낸다.

---

## Claude Code 프롬프트 (여기부터 복사)

당신은 CoreDXI-Web(Next.js 15 App Router + Prisma + Supabase, Vercel 배포) 저장소에서 작업합니다. 루트 `CLAUDE.md`의 작업 규칙을 전부 준수하세요. 특히: `prisma migrate dev` 금지(이번 작업은 DB 마이그레이션 없음), 브랜드 컬러 `#1E4E8C`/`rounded-xl` 이상, shadcn/ui 우선, 컴포넌트에 `[홍보팀]` 한국어 주석, `any` 금지, Named Export, Conventional Commits.

### 목표

AX 전환 컨설팅 소개서 PDF를 `/solutions` 페이지의 AX 컨설팅 카드에서 다운로드할 수 있게 게시하고, 홍보팀이 코드 없이 버튼 문구·파일 URL을 바꿀 수 있도록 CMS 필드를 추가합니다. 설계·결정 근거는 `docs/superpowers/plans/2026-08-30-ax-consulting-brochure-action-plan.md`의 **0절 결정사항과 2절 S4-1~S4-7**입니다. 작업 전에 이 문서를 먼저 읽으세요. 스코프 확장 금지 — 여기 적힌 것만 합니다.

### 전제 확인 (먼저)

- `public/docs/coredxi-ax-consulting-brochure.pdf`가 존재하고 2MB 이하인지 확인합니다(`ls -la public/docs`). 없으면 **중단하고 사용자에게 S3 PDF 내보내기를 요청**하세요. 임의로 다른 PDF를 만들어 넣지 마세요.
- `git status`가 깨끗하고 현재 브랜치가 `main`이며 `origin/main`과 동일한지 확인합니다.

### 작업 순서

1. **브랜치**: `main`에서 `feat/solutions-brochure-download`를 새로 만듭니다(8/26 브랜치 혼선 재발 방지 — 기존 feat 브랜치에서 분기 금지).

2. **CMS 필드 추가** — `src/lib/page-content/solutions.ts`
   - `SolutionsContent` 타입에 `brochureLabel: string`, `brochureUrl: string` 추가.
   - `SOLUTIONS_CONTENT_DEFAULTS`에 기본값 `brochureLabel: "소개서 PDF 다운로드"`, `brochureUrl: "/docs/coredxi-ax-consulting-brochure.pdf"`.
   - 기존 DB에 저장된 `PageContent` JSON에는 이 두 필드가 없으므로, 읽기 시 기본값과 병합되는 기존 패턴(`src/lib/page-content.ts`의 `getPageContent`)이 신규 필드를 안전하게 채우는지 확인하고, 아니라면 최소 수정으로 보장하세요. 저장 액션(`src/app/admin/(panel)/solutions/actions.ts`)의 검증 스키마에도 두 필드를 추가합니다(`brochureUrl`은 `/`로 시작하는 상대 경로 또는 `https://` 절대 URL만 허용 — `src/lib/url-safety.ts` 패턴 참고).

3. **공개 페이지 버튼** — `src/app/solutions/page.tsx`
   - 솔루션 카드 3종 중 **AX 컨설팅 카드**(`solutions` 배열에서 badge/title로 식별 — 코드에서 실제 값 확인) 하단에 보조 버튼 1개 추가: shadcn `Button variant="outline"` + `rounded-xl` + 다운로드 아이콘(lucide `Download`).
   - 정적 PDF이므로 `next/link`가 아닌 `<a href={content.brochureUrl} download target="_blank" rel="noopener">` 형태. 기존 `TrackedCtaLink`(`src/components/analytics/TrackedCtaLink.tsx`)를 재사용할 수 있으면 `location="solutions_brochure_download"`로 재사용하고, `next/link` 프리페치가 PDF에 걸리지 않도록 `prefetch={false}` 또는 `<a>` 렌더 경로를 확인하세요. 재사용이 어색하면 같은 방식(`trackEvent("cta_click", { cta_location: "solutions_brochure_download" })`)의 소형 클라이언트 컴포넌트를 `src/components/solutions/`에 만듭니다.
   - `brochureUrl`이 빈 문자열이면 버튼을 렌더하지 않습니다(홍보팀이 임시로 숨길 수 있는 장치).
   - 모바일에서 카드 레이아웃이 깨지지 않는지 확인(카드 폭·버튼 줄바꿈).

4. **관리자 폼** — `src/app/admin/(panel)/solutions/SolutionsContentForm.tsx`
   - "소개서 다운로드" 섹션을 추가해 `brochureLabel`, `brochureUrl` 두 입력을 노출. 도움말 문구: "PDF 파일을 교체할 때는 같은 파일명으로 덮어쓰면 URL이 유지됩니다."
   - 기존 필드들과 동일한 저장 흐름·토스트를 사용합니다.

5. **GA4 퍼널 대시보드 주석**
   - 다운로드 클릭은 퍼널 "CTA 클릭" 행에 **포함**하기로 결정됨(S4-4). `Ga4FunnelPanel.tsx`(또는 퍼널 계산 로직 근처)에 "`solutions_brochure_download` 포함" 주석 한 줄만 추가합니다. 계산 로직 변경 금지.

6. **환경 변수**
   - `.env.example`의 `AX_CHECK_BROCHURE_URL` 주석에 프로덕션 값 예시 `https://www.coredxi.com/docs/coredxi-ax-consulting-brochure.pdf`를 적습니다. 실제 Vercel env 등록은 사용자가 하므로 **PR 설명에 "배포 후 Vercel Production/Preview에 `AX_CHECK_BROCHURE_URL` 등록 → T0/T1 팔로업 메일에 소개서 링크 줄이 생김"을 체크리스트로 남기세요.**

7. **테스트**
   - Vitest: `src/app/admin/(panel)/solutions/actions.test.ts`에 신규 필드 검증 케이스(정상 상대경로, `javascript:` 등 거부) 추가. `src/lib/page-content.test.ts`에 기본값 병합으로 신규 필드가 채워지는 케이스 추가.
   - Playwright: `e2e/solutions-brochure.spec.ts` 신규 — `/solutions` 방문 → 소개서 버튼 존재·`href` 확인 → 해당 URL `request.get` → 상태 200, `content-type`에 `application/pdf` 포함. 골든패스 1개만(기존 `e2e/cases-detail.spec.ts` 스타일 참고).
   - `npm run lint`, `npx tsc --noEmit`, `npm run test`, `npm run test:e2e -- solutions-brochure` 전부 통과.

8. **문서 갱신** (코드와 같은 브랜치에서)
   - `CONTENT_GUIDE.md`에 **18번 "소개서 PDF 교체·문구 수정 방법"** 추가: (a) 관리자 → 솔루션 관리에서 버튼 문구·URL 수정, (b) 파일 교체는 개발팀에 `public/docs/coredxi-ax-consulting-brochure.pdf` 덮어쓰기 요청(URL 유지), (c) 버튼 숨기려면 URL을 비움. 17번과 같은 톤·형식.
   - `docs/TODO.md` 1-B 0단계 행의 소개서(0-4) 부분을 "v3 최종 확정(2026-09-03) → S4 게시 완료"로 갱신하고 헤더 "최종 업데이트" 날짜를 오늘로.
   - `docs/superpowers/plans/2026-08-30-ax-consulting-brochure-action-plan.md`의 S3·S4 행에 ✅와 커밋 해시, 6절 문서 반영 목록의 `CONTENT_GUIDE.md` 18번 ⬜→✅.
   - `docs/PRD.md` 5-1 솔루션 페이지 행에 "소개서 PDF 다운로드 버튼(CMS 편집 가능)" 한 구절 추가.

9. **커밋·PR**
   - 커밋은 의미 단위로 나눕니다. 예: `feat(solutions): 소개서 PDF 다운로드 버튼 및 CMS 필드 추가`, `test: solutions 소개서 다운로드 골든패스 E2E 추가`, `docs: CONTENT_GUIDE 18번 소개서 교체 방법 및 소개서 플랜 S3·S4 완료 반영`. PDF 파일 자체는 첫 feat 커밋에 포함.
   - `gh pr create` — base `main`, 제목 `feat: /solutions 소개서 PDF 다운로드 게시 (Phase 1.5 0-4 S4)`. 본문에 ①변경 요약 ②스크린샷(데스크톱·모바일 1장씩, Vercel Preview URL) ③배포 후 사용자 체크리스트: Vercel env `AX_CHECK_BROCHURE_URL` 등록, 프로덕션 `https://www.coredxi.com/docs/coredxi-ax-consulting-brochure.pdf` 200 확인, GA4 실시간 보고서에서 `cta_click` / `cta_location=solutions_brochure_download` 수신 확인, 폰에서 PDF 열림 확인.
   - **main 병합은 하지 않습니다.** PR URL과 Preview URL을 보고하고 종료.

### 하지 않을 것

- 별도 자료실 페이지, 소개서 내용·PDF 수정, `/solutions` 단일 오퍼 재편(2단계 별건), 퍼널 계산 로직 변경, DB 마이그레이션, `@tiptap/*` 등 의존성 변경.

### 마지막 보고 형식

변경 파일 목록 / 테스트 결과(lint·tsc·vitest 개수·E2E) / PR URL·Preview URL / 사용자가 해야 할 배포 후 체크리스트 — 이 네 항목만 간결하게.
