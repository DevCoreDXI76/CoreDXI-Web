#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Git post-commit 훅에서 호출 — 방금 완료된 커밋을 Notion Tasks DB에 기록합니다.

실패해도 git commit 자체에는 영향을 주지 않습니다 (exit 0).
"""

import os
import re
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from dotenv import load_dotenv
except ImportError:
    print("[Notion 훅] python-dotenv 미설치 — py -m pip install python-dotenv httpx")
    sys.exit(0)

try:
    import httpx
except ImportError:
    print("[Notion 훅] httpx 미설치 — py -m pip install httpx")
    sys.exit(0)

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
TASKS_DB = os.getenv("NOTION_TASKS_DB_ID", "")
PROJECT_PAGE_ID = os.getenv("NOTION_PROJECT_PAGE_ID", "")

PREFIXES = ["feat", "fix", "refactor", "chore", "docs", "style", "test", "perf", "build"]
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}


def git(args: list[str]) -> str:
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


def parse_commit_message(full_message: str) -> tuple[str, str, str]:
    """(task_name, work_type, first_line) 반환."""
    first_line = full_message.splitlines()[0].strip() if full_message.strip() else "(no message)"
    work_type = ""
    task_name = first_line

    for prefix in PREFIXES:
        pattern = re.compile(rf"^{prefix}\s*:\s*(.+)$", re.IGNORECASE)
        m = pattern.match(first_line)
        if m:
            work_type = prefix.lower()
            task_name = m.group(1).strip() or first_line
            break

    return task_name[:100], work_type, first_line


def build_commit_url(commit_hash: str) -> str:
    remote = git(["remote", "get-url", "origin"])
    if not remote:
        return ""
    url = remote.strip()
    # git@github.com:user/repo.git -> https://github.com/user/repo
    if url.startswith("git@"):
        url = url.replace(":", "/", 1).replace("git@", "https://")
    if url.endswith(".git"):
        url = url[:-4]
    if "github.com" not in url:
        return ""
    return f"{url}/commit/{commit_hash}"


def create_notion_task(
    task_name: str,
    work_type: str,
    commit_url: str,
    files: str,
    completed_at: str,
    tool: str,
) -> None:
    props = {
        "Task명": {"title": [{"text": {"content": task_name}}]},
        "프로젝트": {"relation": [{"id": PROJECT_PAGE_ID}]},
        "상태": {"select": {"name": "완료"}},
        "사용 도구": {"select": {"name": tool if tool in ("Claude Code", "Cursor", "기타") else "기타"}},
        "커밋 링크": {"url": commit_url or None},
        "변경 파일": {"rich_text": to_rich_text(files[:900])},
        "완료 시각": {"date": {"start": completed_at[:10]}},
    }
    if work_type:
        props["작업 유형"] = {"select": {"name": work_type}}

    # url이 None이면 속성 제외
    if not commit_url:
        del props["커밋 링크"]

    resp = httpx.post(
        "https://api.notion.com/v1/pages",
        headers=NOTION_HEADERS,
        json={"parent": {"database_id": TASKS_DB}, "properties": props},
        timeout=20,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Notion API {resp.status_code}: {resp.text[:300]}")


def main() -> int:
    if not all([NOTION_TOKEN, TASKS_DB, PROJECT_PAGE_ID]):
        print("[Notion 훅] .env에 NOTION_TOKEN, NOTION_TASKS_DB_ID, NOTION_PROJECT_PAGE_ID 필요")
        return 0

    commit_hash = git(["log", "-1", "--pretty=%H"])
    if not commit_hash:
        return 0

    full_message = git(["log", "-1", "--pretty=%B"])
    commit_time = git(["log", "-1", "--pretty=%cI"])
    files = git(["diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"])

    task_name, work_type, _ = parse_commit_message(full_message)
    commit_url = build_commit_url(commit_hash)
    tool = os.getenv("VIBE_CODING_TOOL", "기타")

    try:
        create_notion_task(task_name, work_type, commit_url, files, commit_time, tool)
        print(f"✅ Notion Tasks에 기록되었습니다: {task_name}")
    except Exception as e:
        print(f"[Notion 훅] 기록 실패 (커밋은 정상 완료됨): {e}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
