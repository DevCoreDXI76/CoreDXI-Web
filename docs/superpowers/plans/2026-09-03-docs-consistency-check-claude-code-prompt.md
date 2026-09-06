# Claude Code 실행 프롬프트 — PRD/TODO 문서 정합성 점검 및 git 개행 오탐 정리

작성일: 2026-09-03 · 배경: 원격(FUSE 마운트) 세션에서 `git status`에 20여 파일이 modified로 표시되나 `git diff -w --stat`는 비어 있음(개행만 다름). `docs/TODO.md` 헤더 "최종 업데이트"가 2026-08-30에 멈춰 있음. 규칙상 계획 변경은 `docs/PRD.md`·`docs/TODO.md`에 먼저 반영돼야 함(CLAUDE.md 5번).

> 아래 구분선 이후 전체를 Claude Code에 붙여 넣는다. 로컬 Windows 환경(정상 git 훅 동작)에서 실행 권장.

---

## Claude Code 프롬프트 (여기부터 복사)

CoreDXI-Web 저장소에서 **문서 정합성 점검만** 수행합니다. 코드 변경 금지, 기능 추가 금지. 루트 `CLAUDE.md` 규칙 준수(Conventional Commits, `docs:` 접두어).

### 1. git 작업 트리 상태 진단

1. `git status --short`로 modified 파일 목록을 확보하고, `git diff --stat`와 `git diff -w --stat`를 비교합니다.
2. `git diff -w --stat`가 비어 있으면 전부 개행(CRLF/LF) 차이입니다. 이 경우 **내용 변경 없이 작업 트리를 되돌리지 말고** 먼저 원인을 확인하세요: `git config core.autocrlf`, `.gitattributes` 존재 여부, 대표 파일 1개의 `file` 출력(`file CONTENT_GUIDE.md`)과 `git show HEAD:CONTENT_GUIDE.md | file -`.
3. 저장소에 `.gitattributes`가 없으면 `* text=auto eol=lf` 한 줄과 바이너리 예외(`*.pdf binary`, `*.pptx binary`, `*.png binary`)를 담은 `.gitattributes`를 **제안만** 하고, 실제 추가·`git add --renormalize`는 사용자 확인 후에 진행하세요(전 파일 개행 정규화는 diff 노이즈가 커서 별도 커밋으로 분리해야 합니다). 확인을 받지 못했으면 이 단계는 보고만 하고 넘어갑니다.
4. `git diff -w`에 실제 내용 변경이 있는 파일이 있으면 파일별로 무엇이 바뀌었는지 요약해 보고하고, 의도된 변경인지 사용자에게 묻기 전까지 커밋하지 않습니다.
5. `.git/hooks/post-commit`의 셔뱅 줄이 CRLF(`#!/bin/sh\r`)인지 `head -c 20 .git/hooks/post-commit | od -c`로 확인합니다. CRLF면 원격 세션에서 훅이 실행되지 않던 원인이므로 LF로 변환합니다(훅 파일은 저장소 추적 대상이 아니므로 커밋 불필요, 결과만 보고).

### 2. `docs/PRD.md` ↔ `docs/TODO.md` ↔ `CLAUDE.md` 정합성

다음 결정·상태가 세 문서에 모두 같은 내용으로 반영돼 있는지 대조하고, 빠진 곳만 최소 문구로 보완합니다(기존 문장 스타일 유지, 재작성 금지):

- **영업채널 자동 팔로업 전환(2026-09-02)**: T0 즉시 메일 + T1 D+2 영업일 09:30 KST Vercel Cron 자동 발송, 관리자 보류·수정·즉시 발송, 영업이사는 HOT 통화만, 킬 스위치 `AX_CHECK_FOLLOWUP_ENABLED`. PRD 5-1 AX 체크 행과 6절 결정 기록(165행 부근)에는 이미 있음 — TODO 1-B와 CLAUDE.md 2절도 동일한지 확인.
- **C 구현 1차 완료(2026-09-02~03)**: main 직접 커밋으로 구현·배포, `prisma migrate deploy` 프로덕션 반영, C-8 프로덕션 검증 완료, 선택 QA(등급×업종 9건) 완료 및 `objectParticle()` 수정(`acb9561`). TODO 1-B에는 반영됨 — PRD에 "자동 팔로업 구현 완료" 상태가 드러나는지 확인(PRD가 요구사항 문서이므로 상태는 한 구절 수준으로만).
- **소개서 0-4 v3 최종 확정(2026-09-03)**과 S3·S4 진행 예정 — TODO 1-B 0단계 행, 8/22 플랜 0-4 행, 소개서 플랜 S2 행에 "v3 최종 확정(2026-09-03)" 반영. (S4 게시 자체는 별도 PR `feat/solutions-brochure-download`에서 문서 갱신하므로 여기서는 확정 사실만.)
- **1-10~1-11 실기기 테스트·첫 링크 발송**: 최초 예정일 09/02가 지났고 아직 시작 전 — TODO 1-B 1단계 행의 "남은 것" 문구가 현 상태(지연 중, 자동 팔로업 붙은 상태에서 테스트)와 맞는지 확인.
- **2단계 보강(09/08~09/26) 잔여 항목**(완료율 점검, `/solutions` 단일 오퍼 재편, `/about` 축약, 블로그 1편)이 PRD 어딘가에 요구사항으로 존재하는지 확인. 없으면 PRD 2절 또는 5-1에 "Phase 1.5 2단계 예정" 한 줄로 추가(상세는 TODO·플랜 링크로).
- Phase 2(CMS 구조 편집·댓글·관리자 다크모드) 시점이 세 문서에서 모두 "Phase 1.5 종료 후, 11월 이후"로 일치하는지 확인.

### 3. `docs/TODO.md` 헤더 갱신

- "최종 업데이트" 날짜를 오늘로, 괄호 안 이력 문장 끝에 "2026-09-02 영업채널 자동 팔로업 전환 결정·구현, 2026-09-03 프로덕션 검증·소개서 v3 확정"을 덧붙입니다.

### 4. 커밋

- 문서 변경만 `docs: PRD·TODO·CLAUDE.md 정합성 점검 — 자동 팔로업 전환·C 구현 완료·소개서 v3 확정 반영` 1커밋. `.gitattributes`를 사용자 확인 후 추가했다면 `chore: .gitattributes로 개행 LF 통일` 별도 커밋. push는 사용자 확인 후.
- 커밋 후 post-commit 훅이 Notion에 기록했는지(훅 출력) 확인해 보고.

### 보고 형식

① 개행 오탐 진단 결과(원인·조치·미조치) ② 세 문서 불일치 목록과 수정한 곳(파일:행) ③ 커밋 해시 ④ 사용자 결정이 필요한 항목 — 네 항목만 간결하게.
