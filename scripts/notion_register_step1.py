#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[1단계] CoreDXI-Web -> Notion 소급 등록: Projects + Tasks

이 스크립트는 다음 순서로 동작합니다:
  1) 프로젝트 루트에서 정보 수집 (package.json, git log, README.md)
  2) 수집한 내용을 화면에 미리보기로 출력
  3) 사용자 확인('y') 후에만 Notion API를 호출해 실제 등록

실행 방법:
  py scripts/notion_register_step1.py
"""

import subprocess
import json
import os
import sys
from pathlib import Path

# Windows cp949 터미널 인코딩 문제 방지
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ─── 의존 패키지 임포트 ────────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
except ImportError:
    print("[ERROR] python-dotenv 미설치: py -m pip install python-dotenv httpx")
    sys.exit(1)

try:
    import httpx
except ImportError:
    print("[ERROR] httpx 미설치: py -m pip install httpx")
    sys.exit(1)

# ─── 경로 & 환경변수 ──────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
PROJECTS_DB  = os.getenv("NOTION_PROJECTS_DB_ID", "")
TASKS_DB     = os.getenv("NOTION_TASKS_DB_ID", "")
GITHUB_BASE  = "https://github.com/DevCoreDXI76/CoreDXI-Web"

if not all([NOTION_TOKEN, PROJECTS_DB, TASKS_DB]):
    print("[ERROR] .env 파일에 아래 값이 설정되어 있어야 합니다:")
    print("  NOTION_TOKEN, NOTION_PROJECTS_DB_ID, NOTION_TASKS_DB_ID")
    sys.exit(1)

# Notion API 공통 헤더
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}


# ─── Notion API 래퍼 ──────────────────────────────────────────────────────

def notion_query_db(db_id: str, filter_body: dict = None) -> dict:
    """데이터베이스 쿼리 (POST /v1/databases/{id}/query)"""
    body = {}
    if filter_body:
        body["filter"] = filter_body
    resp = httpx.post(
        f"https://api.notion.com/v1/databases/{db_id}/query",
        headers=NOTION_HEADERS,
        json=body,
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Notion DB query 실패 ({resp.status_code}): {resp.text[:300]}")
    return resp.json()


def notion_create_page(parent_db_id: str, properties: dict) -> dict:
    """페이지 생성 (POST /v1/pages)"""
    body = {
        "parent": {"database_id": parent_db_id},
        "properties": properties,
    }
    resp = httpx.post(
        "https://api.notion.com/v1/pages",
        headers=NOTION_HEADERS,
        json=body,
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Notion 페이지 생성 실패 ({resp.status_code}): {resp.text[:300]}")
    return resp.json()


# ─── 헬퍼 함수 ────────────────────────────────────────────────────────────

def git(args: list) -> str:
    """git 명령어를 실행하고 stdout 결과를 반환합니다."""
    r = subprocess.run(
        ["git"] + args,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        cwd=ROOT,
    )
    return r.stdout.strip()


def to_rich_text(text: str) -> list:
    """긴 텍스트를 Notion rich_text 배열로 변환합니다 (2000자 제한 처리)."""
    if not text:
        return []
    chunks = []
    for i in range(0, min(len(text), 5400), 1800):
        chunks.append({"text": {"content": text[i : i + 1800]}})
    return chunks


# ─── 1단계: 데이터 수집 ────────────────────────────────────────────────────

def collect_project() -> dict:
    """package.json, git, README에서 프로젝트 정보를 수집합니다."""
    pkg = json.loads((ROOT / "package.json").read_text("utf-8"))
    deps = list(pkg.get("dependencies", {}).keys())

    first_date = git(["log", "--reverse", "--format=%ci", "--max-count=1"])[:10]

    remote = git(["remote", "get-url", "origin"]).rstrip("/")
    if remote.endswith(".git"):
        remote = remote[:-4]

    summary = "(주)코어디엑스아이 공식 홈페이지 - B2B AX 솔루션 소개, 블로그 CMS, 관리자 패널"
    readme = ROOT / "README.md"
    if readme.exists():
        for line in readme.read_text("utf-8").splitlines():
            s = line.strip()
            if s and not s.startswith("#") and not s.startswith("```") and len(s) > 20:
                summary = s[:200]
                break

    SKIP = {
        ".git", "node_modules", ".next", "dist", ".vercel",
        "__pycache__", "generated",
    }
    lines = []
    for item in sorted(ROOT.iterdir()):
        if item.name.startswith(".") or item.name in SKIP:
            continue
        lines.append(f"{'[D]' if item.is_dir() else '[F]'} {item.name}")
        if item.is_dir():
            try:
                for sub in sorted(item.iterdir())[:6]:
                    if sub.name not in SKIP and not sub.name.startswith("."):
                        lines.append(f"  +-- {sub.name}")
            except PermissionError:
                pass
    structure = "\n".join(lines[:45])

    return {
        "name":       "CoreDXI-Web",
        "status":     "개발중",
        "start_date": first_date,
        "summary":    summary,
        "tech_stack": [
            "Next.js", "TypeScript", "React", "Tailwind CSS",
            "Prisma", "NextAuth", "Supabase", "Sentry", "Resend",
        ],
        "libraries":  ", ".join(deps),
        "github":     remote,
        "structure":  structure,
    }


def collect_commits(limit: int = 30) -> tuple:
    """git log에서 커밋 이력을 수집합니다."""
    total_str = git(["rev-list", "--count", "HEAD"])
    total = int(total_str) if total_str.isdigit() else 0

    sep = "|||"
    log = git(["log", f"--max-count={limit}", f"--format=%H{sep}%ai{sep}%s"])

    commits = []
    for line in log.splitlines():
        if sep not in line:
            continue
        parts = line.split(sep, 2)
        if len(parts) < 3:
            continue
        h, date_str, msg = parts[0].strip(), parts[1].strip(), parts[2].strip()

        files_out = git(["diff-tree", "--no-commit-id", "-r", "--name-only", h])

        work_type = ""
        for p in ["feat", "fix", "refactor", "docs", "chore", "style", "test", "perf", "build"]:
            if msg.lower().startswith(p + ":"):
                work_type = p
                break

        commits.append({
            "title":        msg,
            "work_type":    work_type,
            "commit_url":   f"{GITHUB_BASE}/commit/{h}",
            "files":        files_out[:900],
            "completed_at": date_str[:10],
        })
    return total, commits


# ─── 2단계: 미리보기 출력 ─────────────────────────────────────────────────

def print_preview(proj: dict, total: int, commits: list):
    W = 70
    print()
    print("=" * W)
    print("  [Projects DB] 등록 예정 내용")
    print("=" * W)
    rows = [
        ("프로젝트명",  proj["name"]),
        ("상태",        proj["status"]),
        ("시작일",      proj["start_date"]),
        ("기술 스택",   ", ".join(proj["tech_stack"])),
        ("GitHub",      proj["github"]),
        ("한줄 소개",   (proj["summary"][:62] + "...") if len(proj["summary"]) > 62 else proj["summary"]),
        ("라이브러리",  f"{len(proj['libraries'].split(','))}개"),
    ]
    for key, val in rows:
        print(f"  {key:<12}: {val}")
    print()
    print("=" * W)
    print(f"  [Tasks DB] 총 커밋 {total}개 중 최근 {len(commits)}개 등록 예정")
    print("=" * W)
    print(f"  {'#':<4} {'완료일':<12} {'유형':<10} 커밋 메시지")
    print(f"  {'-'*4} {'-'*12} {'-'*10} {'-'*36}")
    for i, c in enumerate(commits[:6], 1):
        msg = (c["title"][:36] + "...") if len(c["title"]) > 36 else c["title"]
        wt  = c["work_type"] if c["work_type"] else "-"
        print(f"  {i:<4} {c['completed_at']:<12} {wt:<10} {msg}")
    if len(commits) > 6:
        print(f"  ... 이하 {len(commits) - 6}건 생략 (전체 {len(commits)}건)")
    print("=" * W)


# ─── 3단계: Notion 중복 확인 & 등록 ──────────────────────────────────────

def find_existing_project(name: str) -> str:
    """Projects DB에서 동일 이름 프로젝트를 검색합니다."""
    res = notion_query_db(
        PROJECTS_DB,
        filter_body={"property": "프로젝트명", "title": {"equals": name}},
    )
    pages = res.get("results", [])
    return pages[0]["id"] if pages else ""


def create_project(proj: dict) -> str:
    """Projects DB에 프로젝트 1건을 생성하고 페이지 ID를 반환합니다."""
    page = notion_create_page(
        parent_db_id=PROJECTS_DB,
        properties={
            "프로젝트명": {
                "title": [{"text": {"content": proj["name"]}}]
            },
            "상태": {
                "select": {"name": proj["status"]}
            },
            "시작일": {
                "date": {"start": proj["start_date"]}
            },
            "한줄 소개": {
                "rich_text": to_rich_text(proj["summary"])
            },
            "기술 스택": {
                "multi_select": [{"name": t} for t in proj["tech_stack"]]
            },
            "사용 라이브러리": {
                "rich_text": to_rich_text(proj["libraries"])
            },
            "깃허브 repo 링크": {
                "url": proj["github"]
            },
            "프로젝트 구조": {
                "rich_text": to_rich_text(proj["structure"])
            },
        },
    )
    return page["id"]


def create_task(task: dict, project_id: str):
    """Tasks DB에 커밋 기반 Task 1건을 생성합니다."""
    props = {
        "Task명": {
            "title": [{"text": {"content": task["title"][:100]}}]
        },
        "프로젝트": {
            "relation": [{"id": project_id}]
        },
        "상태": {
            "select": {"name": "완료"}
        },
        "커밋 링크": {
            "url": task["commit_url"]
        },
        "변경 파일": {
            "rich_text": to_rich_text(task["files"])
        },
        "완료 시각": {
            "date": {"start": task["completed_at"]}
        },
    }
    if task["work_type"]:
        props["작업 유형"] = {"select": {"name": task["work_type"]}}

    notion_create_page(parent_db_id=TASKS_DB, properties=props)


# ─── 메인 ──────────────────────────────────────────────────────────────────

def main():
    print()
    print("=" * 70)
    print("  [1단계] CoreDXI-Web Notion 소급 등록 - Projects + Tasks")
    print("=" * 70)

    # 1. 데이터 수집
    print("\n[수집 중] 프로젝트 정보 분석 중...")
    proj = collect_project()

    print("[수집 중] git 커밋 이력 수집 중...")
    total, commits = collect_commits(30)
    if total > 30:
        print(f"  -> 전체 커밋 {total}개 중 최근 30개만 가져왔습니다.")

    # 2. 중복 확인
    print(f"\n[확인 중] Notion Projects DB에서 '{proj['name']}' 중복 검사 중...")
    try:
        dup_id = find_existing_project(proj["name"])
    except RuntimeError as e:
        print(f"\n[오류] Notion API 호출 실패: {e}")
        print("  토큰/DB ID 확인 또는 Notion 통합 연결 상태를 점검하세요.")
        sys.exit(1)

    if dup_id:
        print(f"\n[주의] '{proj['name']}' 이름의 프로젝트가 이미 존재합니다.")
        print(f"  페이지 ID: {dup_id}")
        print("  중복 생성을 방지하기 위해 종료합니다.")
        sys.exit(0)
    print("  -> 중복 없음. 계속 진행합니다.")

    # 3. 미리보기
    print_preview(proj, total, commits)

    # 4. 사용자 확인
    print()
    answer = input("이대로 Notion에 등록할까요? (y/n): ").strip().lower()
    if answer != "y":
        print("취소했습니다.")
        sys.exit(0)

    # 5. Projects 등록
    print("\n[등록 중] Projects DB에 프로젝트 생성 중...")
    try:
        project_id = create_project(proj)
        print(f"  [완료] Projects 1건 생성 (ID: ...{project_id[-8:]})")
    except RuntimeError as e:
        print(f"  [오류] Projects 생성 실패: {e}")
        sys.exit(1)

    # 6. Tasks 등록
    print(f"\n[등록 중] Tasks DB에 {len(commits)}건 생성 중...")
    failed = []
    for i, commit in enumerate(commits, 1):
        try:
            create_task(commit, project_id)
        except RuntimeError as e:
            failed.append((i, commit["title"][:40], str(e)))
        if i % 5 == 0 or i == len(commits):
            print(f"  {i}/{len(commits)} 처리 완료...")

    # 7. 결과 출력
    success_count = len(commits) - len(failed)
    print()
    print("=" * 70)
    print(f"  [완료] Projects 1건, Tasks {success_count}건 등록 완료!")
    if failed:
        print(f"  [경고] 실패 {len(failed)}건:")
        for idx, title, err in failed:
            print(f"    #{idx} '{title}': {err}")
    print(f"\n  Notion에서 확인하세요:")
    print(f"  https://notion.so/{PROJECTS_DB.replace('-', '')}")
    print("=" * 70)


if __name__ == "__main__":
    main()
