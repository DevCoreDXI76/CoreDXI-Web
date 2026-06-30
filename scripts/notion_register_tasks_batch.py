#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tasks DB 추가 등록 — git 커밋을 30개씩 배치로 Notion에 등록

이미 등록된 커밋(커밋 링크 기준)은 건너뛰고, 남은 커밋만 등록합니다.

실행 방법:
  py scripts/notion_register_tasks_batch.py
  py scripts/notion_register_tasks_batch.py --batch-size 30 --yes
"""

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from dotenv import load_dotenv
except ImportError:
    print("[ERROR] py -m pip install python-dotenv httpx")
    sys.exit(1)

try:
    import httpx
except ImportError:
    print("[ERROR] py -m pip install httpx")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
PROJECTS_DB  = os.getenv("NOTION_PROJECTS_DB_ID", "")
TASKS_DB     = os.getenv("NOTION_TASKS_DB_ID", "")
PROJECT_NAME = "CoreDXI-Web"
GITHUB_BASE  = "https://github.com/DevCoreDXI76/CoreDXI-Web"

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}


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


def notion_query_all(db_id: str, filter_body: dict) -> list:
    results = []
    cursor = None
    while True:
        body = {"page_size": 100, "filter": filter_body}
        if cursor:
            body["start_cursor"] = cursor
        resp = httpx.post(
            f"https://api.notion.com/v1/databases/{db_id}/query",
            headers=NOTION_HEADERS,
            json=body,
            timeout=30,
        )
        if resp.status_code != 200:
            raise RuntimeError(f"query 실패 ({resp.status_code}): {resp.text[:300]}")
        data = resp.json()
        results.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return results


def notion_create_task(task: dict, project_id: str):
    props = {
        "Task명": {"title": [{"text": {"content": task["title"][:100]}}]},
        "프로젝트": {"relation": [{"id": project_id}]},
        "상태": {"select": {"name": "완료"}},
        "커밋 링크": {"url": task["commit_url"]},
        "변경 파일": {"rich_text": to_rich_text(task["files"])},
        "완료 시각": {"date": {"start": task["completed_at"]}},
    }
    if task["work_type"]:
        props["작업 유형"] = {"select": {"name": task["work_type"]}}

    resp = httpx.post(
        "https://api.notion.com/v1/pages",
        headers=NOTION_HEADERS,
        json={"parent": {"database_id": TASKS_DB}, "properties": props},
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"생성 실패 ({resp.status_code}): {resp.text[:300]}")


def collect_all_commits() -> list:
    sep = "|||"
    log = git(["log", f"--format=%H{sep}%ai{sep}%s"])
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
            "hash": h,
            "title": msg,
            "work_type": work_type,
            "commit_url": f"{GITHUB_BASE}/commit/{h}",
            "files": files_out[:900],
            "completed_at": date_str[:10],
        })
    return commits


def get_existing_commit_urls(project_id: str) -> set:
    pages = notion_query_all(
        TASKS_DB,
        filter_body={"property": "프로젝트", "relation": {"contains": project_id}},
    )
    urls = set()
    for page in pages:
        url = page["properties"].get("커밋 링크", {}).get("url")
        if url:
            urls.add(url)
    return urls


def find_project_id(name: str) -> str:
    pages = notion_query_all(
        PROJECTS_DB,
        filter_body={"property": "프로젝트명", "title": {"equals": name}},
    )
    return pages[0]["id"] if pages else ""


def chunk_list(items: list, size: int) -> list[list]:
    return [items[i : i + size] for i in range(0, len(items), size)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-size", type=int, default=30)
    parser.add_argument("--yes", action="store_true", help="확인 없이 바로 등록")
    parser.add_argument("--project", default=PROJECT_NAME)
    args = parser.parse_args()

    if not all([NOTION_TOKEN, PROJECTS_DB, TASKS_DB]):
        print("[ERROR] .env에 NOTION_TOKEN, PROJECTS_DB, TASKS_DB 필요")
        sys.exit(1)

    print("=" * 70)
    print("  Tasks DB 배치 추가 등록")
    print("=" * 70)

    project_id = find_project_id(args.project)
    if not project_id:
        print(f"[오류] '{args.project}' 프로젝트를 찾을 수 없습니다.")
        sys.exit(1)
    print(f"\n프로젝트: {args.project} (...{project_id[-8:]})")

    existing_urls = get_existing_commit_urls(project_id)
    print(f"이미 등록된 Task: {len(existing_urls)}건")

    all_commits = collect_all_commits()
    pending = [c for c in all_commits if c["commit_url"] not in existing_urls]
    print(f"전체 커밋: {len(all_commits)}건 / 미등록: {len(pending)}건")

    if not pending:
        print("\n등록할 커밋이 없습니다. 모두 등록 완료 상태입니다.")
        return

    batches = chunk_list(pending, args.batch_size)
    print(f"배치 크기: {args.batch_size} -> 총 {len(batches)}배치 예정\n")

    for i, batch in enumerate(batches, 1):
        print(f"--- 배치 {i}/{len(batches)} ({len(batch)}건) ---")
        print(f"  범위: {batch[0]['completed_at']} ~ {batch[-1]['completed_at']}")
        print(f"  예) {batch[0]['title'][:55]}")
        if not args.yes:
            ans = input(f"  배치 {i} 등록할까요? (y/n/a=전체): ").strip().lower()
            if ans == "n":
                print("  건너뜀")
                continue
            if ans == "a":
                args.yes = True

        failed = []
        for j, commit in enumerate(batch, 1):
            try:
                notion_create_task(commit, project_id)
            except RuntimeError as e:
                failed.append((commit["title"][:40], str(e)))
            if j % 10 == 0 or j == len(batch):
                print(f"  {j}/{len(batch)} 처리...")
            time.sleep(0.35)  # Notion API rate limit 여유

        ok = len(batch) - len(failed)
        print(f"  [완료] 배치 {i}: {ok}건 등록" + (f", 실패 {len(failed)}건" if failed else ""))
        for title, err in failed:
            print(f"    실패: {title} -> {err}")

    final_urls = get_existing_commit_urls(project_id)
    print()
    print("=" * 70)
    print(f"  최종 등록 Task: {len(final_urls)}건 / 전체 커밋 {len(all_commits)}건")
    print(f"  https://notion.so/{TASKS_DB.replace('-', '')}")
    print("=" * 70)


if __name__ == "__main__":
    main()
