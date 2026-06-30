# Vibe Coding Study — 새 프로젝트 적용 종합 가이드

지금까지 만든 5개의 자동화 프롬프트를, 새로운 프로젝트(진행중이든 완료된 것이든)에 적용할 때 순서대로 실행하는 종합 안내서입니다.

이 문서 하나만 보면, 어떤 프로젝트든 노션 7개 DB에 채워 넣을 수 있습니다.

---

## 사전 준비 — 한 번만 확인하면 되는 것

아래 6가지 값은 모든 스크립트에서 공통으로 씁니다. 이미 발급/확인하셨다면 메모장 등에 모아두고 재사용하세요.

| 항목 | 비고 |
|---|---|
| Notion API 토큰 | `ntn_`으로 시작하는 값, 워크스페이스당 1개 |
| ① Projects DB ID | |
| ② Documents DB ID | |
| ③ Tasks DB ID | |
| ④ Bug Tracker DB ID | |
| ⑤ Deployment Log DB ID | |
| ⑥ Portfolio DB ID | |
| ⑦ Templates & Tools DB ID | |

각 프로젝트 폴더에 `.env` 파일로 아래처럼 저장해두면, 매번 토큰을 다시 입력할 필요 없이 스크립트들이 자동으로 읽어 씁니다.

```
NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxx
NOTION_PROJECTS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DOCUMENTS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_TASKS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_BUGTRACKER_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DEPLOYMENTLOG_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PORTFOLIO_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_TEMPLATESTOOLS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 새 프로젝트 적용 순서 (4단계)

```
1단계: Projects + Tasks 소급 등록 (기본 뼈대)
        ↓
2단계: Documents + Bug Tracker + Deployment Log 확장 등록
        ↓
3단계: (프로젝트가 끝났거나 거의 완성됐다면) Portfolio 등록
        ↓
4단계: (이후 평소 작업부터) Templates & Tools 자동 깔때기 가동
```

프로젝트가 아직 한참 개발 중이라면 1~2단계만 먼저 하시고, 3단계(Portfolio)는 프로젝트가 마무리될 때 진행하시면 됩니다.

---

## 1단계. Projects + Tasks 소급 등록

**언제 쓰나**: 새 프로젝트를 노션에 처음 등록할 때 가장 먼저 실행

**준비물**: Notion 토큰, Projects DB ID, Tasks DB ID, 프로젝트 폴더 경로

```
지금 작업 중인 이 프로젝트 폴더를 분석해서, Notion의 "Projects"와 "Tasks" 데이터베이스에 소급으로 데이터를 채워넣는 작업을 하고 싶어. 안전하게 진행하기 위해 아래 순서를 반드시 지켜줘.

# 환경 설정
- Notion API 토큰: [.env에서 NOTION_TOKEN 불러오기]
- Projects 데이터베이스 ID: [.env에서 NOTION_PROJECTS_DB_ID 불러오기]
- Tasks 데이터베이스 ID: [.env에서 NOTION_TASKS_DB_ID 불러오기]
- 분석할 프로젝트 폴더: [현재 폴더]
- notion-client 파이썬 패키지를 사용해줘

# 1단계 — 정보 수집 (아직 노션에 아무것도 쓰지 마)

## Projects DB에 채울 정보
- 프로젝트명: 폴더 이름 또는 package.json의 name 필드
- 상태: 최근 커밋이 활발하면 "개발중"으로 추정 (확실치 않으면 "개발중"을 기본값으로)
- 시작일: git log의 가장 오래된 커밋 날짜
- 기술 스택: package.json의 dependencies, requirements.txt, 또는 주요 설정 파일에서 추출한 프레임워크/언어 목록
- 사용 라이브러리: package.json dependencies 전체 목록 (devDependencies는 제외)
- 프로젝트 구조: 최상위 2단계 정도의 폴더/파일 트리 (node_modules, .git 등은 제외)
- 깃허브 repo 링크: git remote -v 결과에서 추출
- 한줄 소개: README.md 파일이 있다면 그 첫 문단을 참고해서 한 줄로 요약 (없으면 비워둠)

## Tasks DB에 채울 정보 (커밋 1개당 Task 1개)
git log 전체 이력을 가져와서, 커밋 하나당 다음 정보를 정리해줘:
- Task명: 커밋 메시지의 첫 줄
- 상태: "완료" 고정
- 사용 도구: 알 수 없으면 "기타"로 비워둠
- 커밋 링크: 깃허브에 푸시되어 있다면 해당 커밋의 URL
- 변경 파일: 그 커밋에서 변경된 파일 목록
- 작업 유형: 커밋 메시지가 "feat:", "fix:", "refactor:" 등으로 시작하면 그 prefix를 추출, 없으면 비워둠
- 완료 시각: 그 커밋의 날짜/시각

커밋 개수가 너무 많으면(50개 이상) 최근 30개만 우선 가져오고 알려줘.

# 2단계 — 미리보기 보여주기 (반드시 거쳐야 함)
수집한 정보를 표로 정리해서 보여주고 "이대로 노션에 등록할까요? (네/아니오)"라고 물어봐줘.

# 3단계 — "네" 확인 후에만 실제 등록
Projects 1건 생성 → 그 페이지 ID로 Tasks 각각을 relation 연결하며 생성 → "Projects 1건, Tasks OO건 등록 완료"라고 알려줘.

# 주의사항
- 절대 미리보기 없이 바로 쓰지 마
- 같은 프로젝트명이 이미 있으면 중복 생성하지 말고 먼저 알려줘
- 토큰은 .env로 분리
```

---

## 2단계. Documents + Bug Tracker + Deployment Log 확장 등록

**언제 쓰나**: 1단계 끝난 직후, 같은 프로젝트에 이어서 실행

**준비물**: 1단계와 동일 + Documents/Bug Tracker/Deployment Log DB ID

```
이 프로젝트 폴더를 분석해서, Notion의 Documents, Bug Tracker, Deployment Log 데이터베이스에 소급으로 데이터를 채워넣는 작업을 하고 싶어. Projects와 Tasks는 이미 등록되어 있으니, 먼저 확인하고 새로 만들지 마.

# 환경 설정
- Notion API 토큰, Projects/Tasks/Documents/BugTracker/DeploymentLog DB ID: [.env에서 각각 불러오기]
- 분석할 프로젝트 폴더: [현재 폴더]

# 0단계 — 중복 확인
Projects DB에서 이 프로젝트명을 검색해서 페이지 ID를 가져와줘 (이후 relation 연결에 사용).

# 1단계 — 정보 수집

## Documents
README.md, docs/ 폴더, PLAN.md, PRD.md 등 기획 문서로 보이는 파일을 찾아서:
- 제목, 문서 종류(PRD/화면설계서/PLAN 추정), 버전 1 고정, 변경 사유는 "최초 소급 등록", 작성일은 그 파일의 최초 커밋 날짜
못 찾으면 "기획 문서 파일을 찾지 못했습니다"라고 알리고 건너뛰기.

## Bug Tracker (반드시 후보만 제시, 자동 등록 금지)
커밋 메시지가 "fix:", "bugfix:", "hotfix:"로 시작하거나 "버그/오류/에러"가 포함된 커밋들을 후보로 추려서 표로만 보여주기.

## Deployment Log
vercel.json, netlify.toml, .github/workflows, Dockerfile 등을 찾아서 배포 플랫폼 추정. 못 찾으면 "배포 설정 파일을 찾지 못했습니다"라고 알리고 건너뛰기.

# 2단계 — 표별로 따로따로 확인받기
Documents/Bug Tracker/Deployment Log 각각 "등록할까요?"를 따로 물어봐줘 (한꺼번에 묶지 말 것).

# 3단계 — 확인된 것만 등록
등록 후 표별로 몇 건 등록했는지 정리해서 보여줘.

# 주의사항
- 빈 정보를 억지로 추정해서 채우지 마
- 토큰은 .env에서 불러오기
```

---

## 3단계. Portfolio 등록 (프로젝트 완료 시점에)

**언제 쓰나**: 프로젝트가 끝났거나 거의 완성되어, 크몽 등록을 준비할 때

**준비물**: Notion 토큰, Projects/Tasks/Portfolio DB ID, 프로젝트명

```
Notion의 Portfolio 데이터베이스에 새 항목을 만들고 싶어. 자동으로 채울 수 있는 부분은 채우고, 글로 써야 하는 부분은 초안만 작성해줘. 절대 내 확인 없이 최종 등록하지 마.

# 환경 설정
- Notion API 토큰, Projects/Tasks/Portfolio DB ID: [.env에서 불러오기]
- 포트폴리오로 만들 프로젝트명: [정확한 이름 입력]

# 1단계 — 자동으로 채울 수 있는 부분
- 프로젝트: relation 연결
- 1차 카테고리: "IT·프로그래밍" 고정
- 고객사/업종: "개인 프로젝트" 고정 (다른 경우로 보이면 먼저 물어보기)
- 등록 상태: "초안" 고정
- 참여 기간: 연결된 Tasks의 시작/완료 시각 범위로 계산
- 2차 카테고리: 기술 스택 참고해서 추정 (애매하면 "웹 개발")

# 2단계 — 초안만 작성 (화면에 먼저 보여주기)
Projects의 "한줄 소개"/"프로젝트 구조"/"사용 라이브러리"와 Tasks의 내용을 참고해서:
- 프로젝트 요약(3~5줄), 프로젝트 목적, 주요 기능/메뉴, 참여 내용 초안 작성
- 표로 정리해서 보여주고 "이 초안으로 등록할까요? 수정하고 싶은 부분 있으면 말씀해주세요"라고 물어보기

# 3단계 — 확인 후 등록
사용자 확인/수정 반영해서 등록. 메인/상세 이미지, 노출 서비스, 크몽 등록일은 비워두고 "노션에서 직접 채워주세요"라고 안내.

# 주의사항
- 고정값이라도 명백히 다른 경우면 먼저 물어보기
- 글 초안은 과장 없이 담백하고 구체적으로 (크몽 비승인 방지)
```

---

## 4단계. Templates & Tools 자동 깔때기 (지속 운영)

**언제 쓰나**: ④-1은 모든 평소 작업에 항상 적용, ④-2는 2주~한 달에 한 번

### ④-1. 평소 작업 프롬프트 끝에 매번 붙이는 한 줄

```
이 작업이 끝나면, 방금 작성한 프롬프트나 코드가 다른 프로젝트에서도 재사용할 만큼 일반적이고 효과적이었는지 스스로 판단해줘. 범용적인 패턴이라면 Tasks DB 항목의 "재사용 후보"를 체크해줘. 애매하면 체크하지 마.
```

### ④-2. 주기적으로 별도 실행

```
Notion의 Tasks 데이터베이스에서 "재사용 후보"가 체크되어 있는 항목들을 찾아서, 아직 Templates & Tools로 옮겨지지 않은 것들만 골라 보여주고, 내가 선택한 것만 Templates & Tools에 옮겨줘.

# 환경 설정
- Notion API 토큰, Tasks/TemplatesTools DB ID: [.env에서 불러오기]

# 1단계 — 후보 조회
"재사용 후보" 체크된 항목 중 Templates & Tools에 미등록인 것만 조회.

# 2단계 — 번호 매겨서 표로 보여주고 선택받기
Task명/프롬프트 원문/배운 점/출처 프로젝트를 표로 보여주고 "옮길 번호를 알려주세요"라고 묻기.

# 3단계 — 선택한 것만 옮기기
이름은 좀 더 일반화해서, 종류는 프롬프트/API키/MCP설정/코드스니펫 중 분류, 내용/어디서쓰나/출처프로젝트 채워서 등록.

# 주의사항
- 절대 후보를 바로 옮기지 말고 항상 번호로 선택받기
- API 키 실제 값이 내용에 포함되어 있으면 경고하기
```

---

## 새 프로젝트 적용 시 체크리스트

새 프로젝트를 노션에 등록할 때마다 아래 순서로 진행하시면 됩니다.

- [ ] 프로젝트 폴더에 `.env` 파일 준비 (토큰 + 7개 DB ID)
- [ ] 1단계 실행 → 미리보기 확인 → 등록
- [ ] 노션에서 결과 검증 (① Projects 페이지 열어서 Tasks가 잘 연결되어 보이는지)
- [ ] 2단계 실행 → Documents/Bug Tracker/Deployment Log 각각 확인하며 등록
- [ ] (프로젝트 진행 중이라면 여기서 멈추고, 평소 작업부터는 ④-1 문구를 계속 사용)
- [ ] (프로젝트가 끝나면) 3단계 실행 → Portfolio 초안 확인 후 등록 → 메인 이미지 직접 추가
- [ ] 2주~한 달마다 ④-2 실행해서 Templates & Tools 정리

---

## 지금까지 만든 개별 프롬프트 파일 (상세 버전이 필요할 때)

이 문서는 요약 종합본입니다. 각 단계의 더 자세한 설명이나 안전장치 설명이 필요하면 아래 개별 파일을 참고하세요.

1. `Claude_Code_Notion_API_7개DB_생성_프롬프트.md` (DB 최초 생성용, 이미 완료됨)
2. `Claude_Code_기존프로젝트_소급등록_프롬프트.md` (1단계 상세본)
3. `Claude_Code_소급등록_확장판_5개DB_프롬프트.md` (2단계 상세본)
4. `Claude_Code_Portfolio_부분자동화_프롬프트.md` (3단계 상세본)
5. `Claude_Code_TemplatesTools_자동깔때기_프롬프트.md` (4단계 상세본)
