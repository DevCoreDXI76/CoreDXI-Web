# Claude Code에 그대로 붙여넣을 프롬프트

아래 내용을 통째로 복사해서 Claude Code 터미널에 붙여넣고 실행하시면 됩니다.
실행 전에 꼭 준비해야 할 것 2가지가 맨 위에 따로 안내되어 있습니다.

---

## ⚠️ 실행 전 준비물 (이 2가지가 없으면 실패합니다)

### 1. Notion API 토큰 발급
1. 브라우저에서 https://www.notion.com/my-integrations 접속
2. "새 API 통합 만들기" 클릭
3. 이름: `Vibe Coding Study` 입력, 워크스페이스 선택 후 제출
4. 화면에 나오는 "시크릿 토큰" (ntn_으로 시작하는 긴 문자열) 복사해서 메모장에 저장

### 2. 노션 페이지와 토큰 연결하기
1. 노션에서 "Vibe Coding Study" 페이지를 열기 (이미 만들어져 있다면 그 페이지)
2. 페이지 오른쪽 위 "..." 메뉴 클릭 → "연결 추가" 또는 "Add connections" 클릭
3. 방금 만든 `Vibe Coding Study` 통합을 선택해서 연결
4. 그 페이지의 URL을 복사해두기 (예: `https://www.notion.so/Vibe-Coding-Study-38f66ca4297680ed82eed4490734768d`)
   → 맨 뒤의 32자리 영문/숫자 조합이 "페이지 ID"입니다. 하이픈(-)이 있다면 떼고 사용하세요.

---

## 여기서부터 Claude Code에 붙여넣을 프롬프트

```
Notion API를 사용해서 "Vibe Coding Study" 워크스페이스에 7개의 데이터베이스를 자동으로 생성하는 파이썬 스크립트를 만들고 실행해줘.

# 환경 설정
- Notion API 토큰: [여기에 위에서 복사한 시크릿 토큰을 붙여넣으세요]
- 부모 페이지 ID: [여기에 위에서 복사한 페이지 ID를 붙여넣으세요]
- .env 파일을 만들어서 위 두 값을 NOTION_TOKEN, NOTION_PARENT_PAGE_ID 라는 이름으로 저장하고, .gitignore에 .env를 추가해줘 (토큰이 깃허브에 올라가지 않도록)
- notion-client 파이썬 패키지를 설치해서 사용해줘 (pip install notion-client)
- Notion API 버전은 가장 최신 안정 버전을 사용해줘

# 만들어야 할 데이터베이스 7개

위 부모 페이지 ID 아래에, 아래 순서대로 7개의 데이터베이스를 생성해줘. 각 데이터베이스의 속성(컬럼) 이름, 타입, 옵션값까지 정확히 아래 명세대로 만들어줘.

---

## ① Projects (프로젝트 목록)

| 속성명 | 타입 | 옵션 |
|---|---|---|
| 프로젝트명 | title | (기본 제목 속성) |
| 상태 | select | 기획, 개발중, 배포완료, 포트폴리오작성중, 완료 |
| 시작일 | date | |
| 종료일 | date | |
| 한줄 소개 | rich_text | |
| 기술 스택 | multi_select | React, Python, Supabase, Next.js, Node.js, Vue (기본 옵션, 나중에 추가 가능) |
| 사용 라이브러리 | rich_text | |
| 사용 스킬/MCP | rich_text | |
| 프로젝트 구조 | rich_text | |
| 깃허브 repo 링크 | url | |
| 배포 URL | url | |

---

## ② Documents (기획 문서)

| 속성명 | 타입 | 옵션 |
|---|---|---|
| 제목 | title | (기본 제목 속성) |
| 프로젝트 | relation | ① Projects 데이터베이스와 연결 |
| 문서 종류 | select | PRD, 화면설계서, PLAN |
| 버전 | number | |
| 변경 사유 | rich_text | |
| 현재 버전 여부 | checkbox | |
| 작성일 | date | |

(이전 버전을 가리키는 self-relation 속성은 Notion API의 데이터베이스 생성 단계에서 자기 자신을 참조하는 게 기술적으로 제약이 있을 수 있으니, 먼저 데이터베이스를 만들고 나서 별도로 "이전 버전" relation 속성을 추가하는 update 단계를 거쳐줘.)

---

## ③ Tasks (할 일/작업 기록)

| 속성명 | 타입 | 옵션 |
|---|---|---|
| Task명 | title | (기본 제목 속성) |
| 프로젝트 | relation | ① Projects 연결 |
| 상태 | select | 할일, 진행중, 완료, 보류 |
| 우선순위 | select | High, Mid, Low |
| 관련 PLAN | relation | ② Documents 연결 |
| 사용 도구 | select | Claude Code, Cursor, 기타 |
| 프롬프트 원문 | rich_text | |
| 커밋 링크 | url | |
| 변경 파일 | rich_text | |
| 작업 유형 | select | feat, fix, refactor |
| 시작 시각 | date | |
| 완료 시각 | date | |
| 테스트 결과 | rich_text | |
| 배운 점 | rich_text | |
| 재사용 후보 | checkbox | |

---

## ④ Bug Tracker (버그 트래커)

| 속성명 | 타입 | 옵션 |
|---|---|---|
| 버그명 | title | (기본 제목 속성) |
| 프로젝트 | relation | ① Projects 연결 |
| 상태 | select | 발생, 조사중, 해결됨 |
| 심각도 | select | 높음, 중간, 낮음 |
| 발생 상황 | rich_text | |
| 에러 메시지/로그 | rich_text | |
| 원인 | rich_text | |
| 해결 방법 | rich_text | |
| 관련 Task | relation | ③ Tasks 연결 |
| 재발 방지 메모 | rich_text | |

---

## ⑤ Deployment Log (배포 기록)

| 속성명 | 타입 | 옵션 |
|---|---|---|
| 제목 | title | (기본 제목 속성) |
| 프로젝트 | relation | ① Projects 연결 |
| 배포 플랫폼 | select | Vercel, Netlify, AWS, 기타 |
| 날짜 | date | |
| 이슈/에러 내용 | rich_text | |
| 해결 방법 | rich_text | |
| 배포 버전/태그 | rich_text | |

---

## ⑥ Portfolio (포트폴리오)

| 속성명 | 타입 | 옵션 |
|---|---|---|
| 포트폴리오 제목 | title | (기본 제목 속성) |
| 프로젝트 | relation | ① Projects 연결 |
| 1차 카테고리 | select | IT·프로그래밍 |
| 2차 카테고리 | select | 웹 개발, 앱 개발, 자동화, 기타 |
| 프로젝트 요약 | rich_text | |
| 프로젝트 목적 | rich_text | |
| 주요 기능/메뉴 | rich_text | |
| 참여 내용 | rich_text | |
| 참여 기간 | date | (range 포함 날짜) |
| 고객사/업종 | rich_text | |
| 노출 서비스 | rich_text | |
| 등록 상태 | select | 초안, 크몽등록완료, 승인대기, 승인됨, 비승인 |
| 크몽 등록일 | date | |
| 비승인 사유 | rich_text | |

(메인 이미지, 상세 이미지 속성은 Notion API로 파일 속성을 직접 만드는 데 제약이 있을 수 있으니, 만들 수 있으면 files 타입으로 만들고, 안 되면 만든 후 노션 화면에서 내가 직접 추가하라고 알려줘.)

---

## ⑦ Templates & Tools (재사용 공구함)

| 속성명 | 타입 | 옵션 |
|---|---|---|
| 이름 | title | (기본 제목 속성) |
| 종류 | select | 프롬프트, API 키, MCP 설정, 코드 스니펫 |
| 내용 | rich_text | |
| 어디서 쓰나 | rich_text | |
| 사용 횟수 | number | |
| 출처 프로젝트 | relation | ① Projects 연결 |
| 즐겨찾기 | checkbox | |

---

# 작업 순서
1. ① Projects를 가장 먼저 만들어줘 (다른 모든 DB가 여기에 relation으로 연결되니까)
2. ②~⑦은 그 다음에 순서대로 만들어줘
3. relation 속성을 만들 때는 ① Projects의 데이터베이스 ID가 필요하니, 미리 변수에 저장해뒀다가 사용해줘
4. 각 데이터베이스를 만들 때마다 "○○ 데이터베이스 생성 완료"라고 콘솔에 출력해줘
5. 7개를 다 만들고 나면, 각 데이터베이스의 이름과 노션 링크를 정리해서 보여줘
6. 혹시 중간에 에러가 나면 (예: relation 속성 생성 실패) 에러 메시지를 보여주고, 어느 데이터베이스에서 멈췄는지 알려줘. 멈춘 이후 단계부터 다시 실행할 수 있게 스크립트를 짜줘 (처음부터 다시 만들면 중복 생성되니까)

다 만들고 나면, 토큰이 들어있는 .env 파일은 깃허브에 올리면 안 된다는 걸 다시 한번 알려줘.
```

---

## 실행 후 확인할 것

스크립트가 끝나면 노션에 들어가서 7개 표가 다 생겼는지, 그리고 ①Projects와 다른 표들이 서로 연결(relation)되어 있는지 확인해주세요. 만약 relation 연결이 빠진 속성이 있다면, 그 부분만 노션 화면에서 직접 "관계형" 속성으로 추가하시면 됩니다 (어렵지 않은 작업입니다).
