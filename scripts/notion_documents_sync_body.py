#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Documents DB 페이지 본문 동기화

등록된 Documents 항목의 Notion 페이지 본문에 로컬 마크다운 파일 내용을 채웁니다.

실행:
  py scripts/notion_documents_sync_body.py
  py scripts/notion_documents_sync_body.py --yes
"""

import argparse
import os
import re
import sys
import time
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

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
DOCUMENTS_DB = os.getenv("NOTION_DOCUMENTS_DB_ID", "")
PROJECT_NAME = "CoreDXI-Web"

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}

# Notion 제목 -> 로컬 파일 경로
DOC_FILE_MAP = {
    "CoreDXI-Web PRD (제품 요구사항 명세서)": "docs/PRD.md",
    "CoreDXI-Web TODO 및 로드맵": "docs/TODO.md",
    "CoreDXI-Web README": "README.md",
    "CoreDXI-Web 콘텐츠 수정 가이드": "CONTENT_GUIDE.md",
}

MAX_RICH_TEXT = 2000
BATCH_SIZE = 100


# ─── Notion API ───────────────────────────────────────────────────────────

def notion_request(method: str, path: str, json_body: dict = None) -> dict:
    url = f"https://api.notion.com/v1/{path}"
    resp = httpx.request(method, url, headers=NOTION_HEADERS, json=json_body, timeout=60)
    if resp.status_code not in (200, 204):
        raise RuntimeError(f"{method} {path} 실패 ({resp.status_code}): {resp.text[:400]}")
    return resp.json() if resp.content else {}


def query_all(db_id: str, filter_body: dict) -> list:
    results = []
    cursor = None
    while True:
        body = {"page_size": 100, "filter": filter_body}
        if cursor:
            body["start_cursor"] = cursor
        data = notion_request("POST", f"databases/{db_id}/query", body)
        results.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return results


def get_block_children(block_id: str) -> list:
    results = []
    cursor = None
    while True:
        path = f"blocks/{block_id}/children?page_size=100"
        if cursor:
            path += f"&start_cursor={cursor}"
        data = notion_request("GET", path)
        results.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return results


def delete_all_children(page_id: str):
    children = get_block_children(page_id)
    for block in children:
        notion_request("DELETE", f"blocks/{block['id']}")
        time.sleep(0.15)


def append_blocks(page_id: str, blocks: list):
    for i in range(0, len(blocks), BATCH_SIZE):
        batch = blocks[i : i + BATCH_SIZE]
        notion_request(
            "PATCH",
            f"blocks/{page_id}/children",
            {"children": batch},
        )
        time.sleep(0.4)


# ─── Markdown -> Notion blocks ────────────────────────────────────────────

def rich_text_chunks(text: str, bold: bool = False) -> list:
    """2000자 제한에 맞게 rich_text 배열 생성."""
    if not text:
        return [{"type": "text", "text": {"content": " "}}]
    chunks = []
    for i in range(0, len(text), MAX_RICH_TEXT):
        part = text[i : i + MAX_RICH_TEXT]
        item = {"type": "text", "text": {"content": part}}
        if bold and i == 0:
            item["annotations"] = {"bold": True}
        chunks.append(item)
    return chunks


def paragraph_block(text: str) -> dict:
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": rich_text_chunks(text)},
    }


def heading_block(text: str, level: int) -> dict:
    key = f"heading_{level}"
    return {
        "object": "block",
        "type": key,
        key: {"rich_text": rich_text_chunks(text), "is_toggleable": False},
    }


def bullet_block(text: str) -> dict:
    return {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {"rich_text": rich_text_chunks(text)},
    }


def numbered_block(text: str) -> dict:
    return {
        "object": "block",
        "type": "numbered_list_item",
        "numbered_list_item": {"rich_text": rich_text_chunks(text)},
    }


def code_block(text: str, language: str = "plain text") -> dict:
    lang_map = {
        "ts": "typescript", "tsx": "typescript", "js": "javascript",
        "jsx": "javascript", "py": "python", "sh": "shell", "bash": "shell",
        "md": "markdown", "json": "json", "sql": "sql", "yaml": "yaml",
        "yml": "yaml", "": "plain text",
    }
    lang = lang_map.get(language.lower(), language.lower() or "plain text")
    # Notion code block: split long code into multiple rich_text segments
    return {
        "object": "block",
        "type": "code",
        "code": {
            "rich_text": rich_text_chunks(text),
            "language": lang if lang in {
                "typescript", "javascript", "python", "shell", "markdown",
                "json", "sql", "yaml", "plain text", "html", "css",
            } else "plain text",
        },
    }


def divider_block() -> dict:
    return {"object": "block", "type": "divider", "divider": {}}


def strip_md_inline(text: str) -> str:
    """간단한 인라인 마크다운 제거."""
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text.strip()


def markdown_to_blocks(md: str) -> list:
    blocks = []
    lines = md.splitlines()
    i = 0
    in_code = False
    code_lines: list[str] = []
    code_lang = ""

    while i < len(lines):
        line = lines[i]

        # fenced code block
        if line.strip().startswith("```"):
            if in_code:
                blocks.append(code_block("\n".join(code_lines), code_lang))
                code_lines = []
                in_code = False
                code_lang = ""
            else:
                in_code = True
                code_lang = line.strip()[3:].strip()
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if stripped == "---" or stripped == "***":
            blocks.append(divider_block())
            i += 1
            continue

        # headings
        m = re.match(r"^(#{1,3})\s+(.+)$", stripped)
        if m:
            level = len(m.group(1))
            blocks.append(heading_block(strip_md_inline(m.group(2)), level))
            i += 1
            continue

        if stripped.startswith("#### "):
            blocks.append(heading_block(strip_md_inline(stripped[5:]), 3))
            i += 1
            continue

        # bullet list
        if re.match(r"^[-*+]\s+", stripped):
            text = re.sub(r"^[-*+]\s+", "", stripped)
            blocks.append(bullet_block(strip_md_inline(text)))
            i += 1
            continue

        # numbered list
        if re.match(r"^\d+\.\s+", stripped):
            text = re.sub(r"^\d+\.\s+", "", stripped)
            blocks.append(numbered_block(strip_md_inline(text)))
            i += 1
            continue

        # table row -> paragraph
        if stripped.startswith("|"):
            blocks.append(paragraph_block(strip_md_inline(stripped)))
            i += 1
            continue

        # blockquote
        if stripped.startswith(">"):
            blocks.append(paragraph_block(strip_md_inline(stripped.lstrip("> ").strip())))
            i += 1
            continue

        blocks.append(paragraph_block(strip_md_inline(stripped)))
        i += 1

    if in_code and code_lines:
        blocks.append(code_block("\n".join(code_lines), code_lang))

    return blocks


# ─── 메인 ─────────────────────────────────────────────────────────────────

def find_project_id(name: str) -> str:
    pages = query_all(
        PROJECTS_DB,
        {"property": "프로젝트명", "title": {"equals": name}},
    )
    return pages[0]["id"] if pages else ""


def prop_title(props: dict) -> str:
    items = props.get("제목", {}).get("title", [])
    return items[0]["plain_text"] if items else ""


def sync_document(page_id: str, title: str, rel_path: str) -> int:
    file_path = ROOT / rel_path
    if not file_path.exists():
        raise FileNotFoundError(f"파일 없음: {rel_path}")

    content = file_path.read_text(encoding="utf-8")
    blocks = markdown_to_blocks(content)

    if not blocks:
        blocks = [paragraph_block("(내용 없음)")]

    # 상단에 출처 안내
    header = [
        paragraph_block(f"출처 파일: {rel_path}"),
        divider_block(),
    ]
    blocks = header + blocks

    print(f"  기존 블록 삭제 중...")
    delete_all_children(page_id)

    print(f"  블록 {len(blocks)}개 업로드 중...")
    append_blocks(page_id, blocks)
    return len(blocks)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--yes", action="store_true", help="확인 없이 실행")
    parser.add_argument("--project", default=PROJECT_NAME)
    args = parser.parse_args()

    if not all([NOTION_TOKEN, PROJECTS_DB, DOCUMENTS_DB]):
        print("[ERROR] .env 설정 확인")
        sys.exit(1)

    print("=" * 70)
    print("  Documents DB 본문 동기화")
    print("=" * 70)

    project_id = find_project_id(args.project)
    if not project_id:
        print(f"[오류] 프로젝트 '{args.project}' 없음")
        sys.exit(1)

    doc_pages = query_all(
        DOCUMENTS_DB,
        {"property": "프로젝트", "relation": {"contains": project_id}},
    )

    targets = []
    for page in doc_pages:
        title = prop_title(page["properties"])
        rel = DOC_FILE_MAP.get(title)
        if rel:
            targets.append((page["id"], title, rel))
        else:
            print(f"[건너뜀] 매핑 없음: {title}")

    print(f"\n동기화 대상: {len(targets)}건\n")
    for _, title, rel in targets:
        print(f"  - {title} <- {rel}")

    if not args.yes:
        ans = input("\n본문을 동기화할까요? (y/n): ").strip().lower()
        if ans != "y":
            print("취소")
            return

    print()
    for page_id, title, rel in targets:
        print(f"[{title}]")
        try:
            count = sync_document(page_id, title, rel)
            print(f"  [완료] {count}개 블록 반영\n")
        except Exception as e:
            print(f"  [오류] {e}\n")

    print("=" * 70)
    print("  Documents 본문 동기화 완료")
    print(f"  https://notion.so/{DOCUMENTS_DB.replace('-', '')}")
    print("=" * 70)


if __name__ == "__main__":
    main()
