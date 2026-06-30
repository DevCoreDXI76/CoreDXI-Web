#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[2단계] CoreDXI-Web -> Notion 소급 등록: Documents + Bug Tracker + Deployment Log

이 스크립트는 다음 순서로 동작합니다:
  1) Projects DB에서 CoreDXI-Web 페이지 ID 조회 (relation 연결용)
  2) Documents / Bug Tracker / Deployment Log 각각 데이터 수집
  3) 세 DB를 순서대로 미리보기 -> 확인 -> 등록 (각각 별도 확인)

전제: 1단계(notion_register_step1.py)가 이미 실행 완료되어야 합니다.

실행 방법:
  py scripts/notion_register_step2.py
"""

import subprocess
import json
import os
import sys
from datetime import datetime
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

NOTION_TOKEN      = os.getenv("NOTION_TOKEN", "")
PROJECTS_DB       = os.getenv("NOTION_PROJECTS_DB_ID", "")
DOCUMENTS_DB      = os.getenv("NOTION_DOCUMENTS_DB_ID", "")
BUGTRACKER_DB     = os.getenv("NOTION_BUGTRACKER_DB_ID", "")
DEPLOYMENTLOG_DB  = os.getenv("NOTION_DEPLOYMENTLOG_DB_ID", "")

missing = [k for k, v in {
    "NOTION_TOKEN":              NOTION_TOKEN,
    "NOTION_PROJECTS_DB_ID":     PROJECTS_DB,
    "NOTION_DOCUMENTS_DB_ID":    DOCUMENTS_DB,
    "NOTION_BUGTRACKER_DB_ID":   BUGTRACKER_DB,
    "NOTION_DEPLOYMENTLOG_DB_ID": DEPLOYMENTLOG_DB,
}.items() if not v]

if missing:
    print(f"[ERROR] .env 파일에 다음 값이 없습니다: {', '.join(missing)}")
    sys.exit(1)

# Notion API 공통 헤더
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}
W = 70  # 출력 너비


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
    r = subprocess.run(
        ["git"] + args,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        cwd=ROOT,
    )
    return r.stdout.strip()


def to_rich_text(text: str) -> list:
    if not text:
        return []
    chunks = []
    for i in range(0, min(len(text), 5400), 1800):
        chunks.append({"text": {"content": text[i : i + 1800]}})
    return chunks


def get_file_first_commit_date(rel_path: str) -> str:
    """파일의 최초 git 커밋 날짜를 반환합니다."""
    out = git(["log", "--follow", "--reverse", "--format=%ci", "--max-count=1", "--", rel_path])
    return out[:10] if out else datetime.now().strftime("%Y-%m-%d")


def divider(title: str = ""):
    if title:
        print(f"\n{'=' * W}")
        print(f"  {title}")
        print(f"{'=' * W}")
    else:
        print("=" * W)


# ─── Projects DB에서 기존 프로젝트 ID 조회 ────────────────────────────────

def get_project_id(name: str) -> str:
    """Projects DB에서 프로젝트 페이지 ID를 가져옵니다."""
    res = notion_query_db(
        PROJECTS_DB,
        filter_body={"property": "프로젝트명", "title": {"equals": name}},
    )
    pages = res.get("results", [])
    return pages[0]["id"] if pages else ""


# ═══════════════════════════════════════════════════════════════════════════
#  DOCUMENTS
# ═══════════════════════════════════════════════════════════════════════════

# 등록할 문서 파일 목록 (상대 경로, 문서 종류, 제목)
DOCUMENT_FILES = [
    ("docs/PRD.md",       "PRD",     "CoreDXI-Web PRD (제품 요구사항 명세서)"),
    ("docs/TODO.md",      "PLAN",    "CoreDXI-Web TODO 및 로드맵"),
    ("README.md",         "PLAN",    "CoreDXI-Web README"),
    ("CONTENT_GUIDE.md",  "화면설계서", "CoreDXI-Web 콘텐츠 수정 가이드"),
]


def collect_documents() -> list:
    docs = []
    for rel_path, doc_type, title in DOCUMENT_FILES:
        full_path = ROOT / rel_path
        if not full_path.exists():
            print(f"  [건너뜀] 파일 없음: {rel_path}")
            continue
        first_date = get_file_first_commit_date(rel_path)
        docs.append({
            "title":      title,
            "doc_type":   doc_type,
            "version":    1,
            "reason":     "최초 소급 등록",
            "created_at": first_date,
            "current":    True,
        })
    return docs


def print_documents_preview(docs: list):
    divider("[Documents DB] 등록 예정 내용")
    if not docs:
        print("  [등록 대상 없음] 문서 파일을 찾지 못했습니다.")
        return
    print(f"  {'#':<4} {'문서 종류':<10} {'작성일':<12} 제목")
    print(f"  {'-'*4} {'-'*10} {'-'*12} {'-'*36}")
    for i, d in enumerate(docs, 1):
        print(f"  {i:<4} {d['doc_type']:<10} {d['created_at']:<12} {d['title']}")
    print()


def create_document(doc: dict, project_id: str):
    notion_create_page(
        parent_db_id=DOCUMENTS_DB,
        properties={
            "제목": {
                "title": [{"text": {"content": doc["title"]}}]
            },
            "프로젝트": {
                "relation": [{"id": project_id}]
            },
            "문서 종류": {
                "select": {"name": doc["doc_type"]}
            },
            "버전": {
                "number": doc["version"]
            },
            "변경 사유": {
                "rich_text": to_rich_text(doc["reason"])
            },
            "현재 버전 여부": {
                "checkbox": doc["current"]
            },
            "작성일": {
                "date": {"start": doc["created_at"]}
            },
        },
    )


# ═══════════════════════════════════════════════════════════════════════════
#  BUG TRACKER
# ═══════════════════════════════════════════════════════════════════════════

FIX_PREFIXES  = ("fix:", "bugfix:", "hotfix:", "bug:")
BUG_KEYWORDS  = ("버그", "오류", "에러", "error", "bug")


def collect_bug_candidates() -> list:
    sep = "|||"
    log = git(["log", "--format=%H" + sep + "%ai" + sep + "%s"])

    candidates = []
    for line in log.splitlines():
        if sep not in line:
            continue
        parts = line.split(sep, 2)
        if len(parts) < 3:
            continue
        h, date_str, msg = parts[0].strip(), parts[1].strip(), parts[2].strip()

        msg_lower = msg.lower()
        is_fix = any(msg_lower.startswith(p) for p in FIX_PREFIXES)
        has_kw  = any(kw in msg_lower for kw in BUG_KEYWORDS)

        if is_fix or has_kw:
            candidates.append({
                "title":      msg,
                "commit_url": f"https://github.com/DevCoreDXI76/CoreDXI-Web/commit/{h}",
                "date":       date_str[:10],
                "severity":   "낮음",
                "status":     "해결됨",
            })
    return candidates


def print_bug_candidates(candidates: list):
    divider("[Bug Tracker DB] 등록 후보 목록")
    if not candidates:
        print("  [후보 없음] fix:/bugfix: 계열 커밋을 찾지 못했습니다.")
        return
    print(f"  {'#':<4} {'발생일':<12} 커밋 메시지")
    print(f"  {'-'*4} {'-'*12} {'-'*50}")
    for i, c in enumerate(candidates, 1):
        msg = (c["title"][:50] + "...") if len(c["title"]) > 50 else c["title"]
        print(f"  {i:<4} {c['date']:<12} {msg}")
    print()
    print("  * 심각도는 기본값 '낮음'으로 등록됩니다. Notion에서 직접 수정하세요.")


def create_bug(bug: dict, project_id: str):
    notion_create_page(
        parent_db_id=BUGTRACKER_DB,
        properties={
            "버그명": {
                "title": [{"text": {"content": bug["title"][:100]}}]
            },
            "프로젝트": {
                "relation": [{"id": project_id}]
            },
            "상태": {
                "select": {"name": bug["status"]}
            },
            "심각도": {
                "select": {"name": bug["severity"]}
            },
            "발생 상황": {
                "rich_text": to_rich_text(f"커밋 링크: {bug['commit_url']}")
            },
        },
    )


# ═══════════════════════════════════════════════════════════════════════════
#  DEPLOYMENT LOG
# ═══════════════════════════════════════════════════════════════════════════

def collect_deployment_entries() -> list:
    entries = []

    vercel_json = ROOT / "vercel.json"
    if vercel_json.exists():
        date = get_file_first_commit_date("vercel.json")
        entries.append({
            "title":    "Vercel 프로덕션 배포 설정 (www.coredxi.com)",
            "platform": "Vercel",
            "date":     date,
            "version":  "최초 설정",
            "note":     "vercel.json 기반 coredxi.com -> www.coredxi.com 리다이렉트 설정",
        })

    ci_file = ROOT / ".github" / "workflows" / "ci.yml"
    if ci_file.exists():
        date = get_file_first_commit_date(".github/workflows/ci.yml")
        entries.append({
            "title":    "GitHub Actions CI 파이프라인 설정",
            "platform": "기타",
            "date":     date,
            "version":  "최초 설정",
            "note":     "main 브랜치 push/PR 시 prisma generate + next build 자동 실행",
        })

    return entries


def print_deployment_preview(entries: list):
    divider("[Deployment Log DB] 등록 예정 내용")
    if not entries:
        print("  [등록 대상 없음] 배포 설정 파일을 찾지 못했습니다.")
        return
    print(f"  {'#':<4} {'플랫폼':<10} {'날짜':<12} 제목")
    print(f"  {'-'*4} {'-'*10} {'-'*12} {'-'*40}")
    for i, e in enumerate(entries, 1):
        print(f"  {i:<4} {e['platform']:<10} {e['date']:<12} {e['title']}")
    print()


def create_deployment(entry: dict, project_id: str):
    notion_create_page(
        parent_db_id=DEPLOYMENTLOG_DB,
        properties={
            "제목": {
                "title": [{"text": {"content": entry["title"]}}]
            },
            "프로젝트": {
                "relation": [{"id": project_id}]
            },
            "배포 플랫폼": {
                "select": {"name": entry["platform"]}
            },
            "날짜": {
                "date": {"start": entry["date"]}
            },
            "배포 버전/태그": {
                "rich_text": to_rich_text(entry["version"])
            },
            "이슈/에러 내용": {
                "rich_text": to_rich_text(entry["note"])
            },
        },
    )


# ═══════════════════════════════════════════════════════════════════════════
#  공통 등록 흐름 (확인 -> 등록)
# ═══════════════════════════════════════════════════════════════════════════

def confirm_and_register_documents(docs: list, project_id: str):
    if not docs:
        print("  -> Documents 항목이 없어 건너뜁니다.")
        return
    answer = input("Documents DB에 등록할까요? (y/n): ").strip().lower()
    if answer != "y":
        print("  -> Documents 등록을 건너뜁니다.")
        return
    failed = []
    for i, doc in enumerate(docs, 1):
        try:
            create_document(doc, project_id)
            print(f"  [{i}/{len(docs)}] '{doc['title'][:40]}' 등록 완료")
        except RuntimeError as e:
            failed.append((doc["title"], str(e)))
    ok = len(docs) - len(failed)
    print(f"\n  [완료] Documents {ok}건 등록" + (f", 실패 {len(failed)}건" if failed else ""))
    for t, e in failed:
        print(f"    실패: '{t}' -> {e}")


def confirm_and_register_bugs(candidates: list, project_id: str):
    if not candidates:
        print("  -> Bug Tracker 후보가 없어 건너뜁니다.")
        return
    print(f"\n  총 {len(candidates)}개 후보 중 등록할 번호를 입력하세요.")
    print("  예) 1,3,5   또는   all   또는   엔터 (건너뜀)")
    answer = input("  선택: ").strip().lower()

    if not answer:
        print("  -> Bug Tracker 등록을 건너뜁니다.")
        return

    if answer == "all":
        selected = candidates
    else:
        indices = []
        for part in answer.split(","):
            part = part.strip()
            if part.isdigit():
                idx = int(part) - 1
                if 0 <= idx < len(candidates):
                    indices.append(idx)
        selected = [candidates[i] for i in indices]

    if not selected:
        print("  -> 유효한 선택이 없습니다. 건너뜁니다.")
        return

    failed = []
    for bug in selected:
        try:
            create_bug(bug, project_id)
        except RuntimeError as e:
            failed.append((bug["title"], str(e)))
    ok = len(selected) - len(failed)
    print(f"\n  [완료] Bug Tracker {ok}건 등록" + (f", 실패 {len(failed)}건" if failed else ""))
    for t, e in failed:
        print(f"    실패: '{t}' -> {e}")


def confirm_and_register_deployments(entries: list, project_id: str):
    if not entries:
        print("  -> Deployment Log 항목이 없어 건너뜁니다.")
        return
    answer = input("Deployment Log DB에 등록할까요? (y/n): ").strip().lower()
    if answer != "y":
        print("  -> Deployment Log 등록을 건너뜁니다.")
        return
    failed = []
    for entry in entries:
        try:
            create_deployment(entry, project_id)
        except RuntimeError as e:
            failed.append((entry["title"], str(e)))
    ok = len(entries) - len(failed)
    print(f"\n  [완료] Deployment Log {ok}건 등록" + (f", 실패 {len(failed)}건" if failed else ""))
    for t, e in failed:
        print(f"    실패: '{t}' -> {e}")


# ─── 메인 ──────────────────────────────────────────────────────────────────

def main():
    divider()
    print("  [2단계] CoreDXI-Web Notion 소급 등록 - Documents + Bug Tracker + Deployment Log")
    divider()

    # 0단계: 기존 Projects 페이지 ID 조회
    print("\n[확인 중] Projects DB에서 'CoreDXI-Web' 페이지 조회 중...")
    try:
        project_id = get_project_id("CoreDXI-Web")
    except RuntimeError as e:
        print(f"\n[오류] Notion API 호출 실패: {e}")
        sys.exit(1)

    if not project_id:
        print("[오류] 'CoreDXI-Web' 프로젝트를 Projects DB에서 찾을 수 없습니다.")
        print("  -> 1단계(notion_register_step1.py)를 먼저 실행하세요.")
        sys.exit(1)
    print(f"  -> 프로젝트 ID 확인 완료 (...{project_id[-8:]})")

    # ─── Documents ─────────────────────────────────────────────────────────
    print("\n[수집 중] 기획 문서 파일 스캔 중...")
    docs = collect_documents()
    if docs:
        print(f"  -> {len(docs)}개 문서 파일 발견")

    print_documents_preview(docs)
    confirm_and_register_documents(docs, project_id)

    # ─── Bug Tracker ───────────────────────────────────────────────────────
    print("\n[수집 중] Bug Tracker 후보 커밋 검색 중...")
    bugs = collect_bug_candidates()
    print(f"  -> fix 계열 커밋 {len(bugs)}건 발견")

    print_bug_candidates(bugs)
    confirm_and_register_bugs(bugs, project_id)

    # ─── Deployment Log ────────────────────────────────────────────────────
    print("\n[수집 중] 배포 설정 파일 탐색 중...")
    deployments = collect_deployment_entries()
    if deployments:
        print(f"  -> {len(deployments)}개 배포 항목 구성")
    else:
        print("  -> 배포 설정 파일을 찾지 못했습니다.")

    print_deployment_preview(deployments)
    confirm_and_register_deployments(deployments, project_id)

    # ─── 완료 ──────────────────────────────────────────────────────────────
    print()
    divider()
    print("  [완료] 2단계 소급 등록이 끝났습니다.")
    print(f"\n  Notion에서 확인하세요:")
    print(f"  https://notion.so/{DOCUMENTS_DB.replace('-', '')}")
    divider()


if __name__ == "__main__":
    main()
