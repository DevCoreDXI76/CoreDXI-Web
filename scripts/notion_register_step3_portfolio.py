#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[3단계] CoreDXI-Web -> Notion Portfolio 부분 자동화

기계적으로 채울 수 있는 필드는 자동으로 채우고,
글로 써야 하는 필드는 초안만 작성한 뒤 사용자 확인 후 등록합니다.

전제: 1단계(Projects + Tasks)가 이미 실행 완료되어 있어야 합니다.

실행 방법:
  py scripts/notion_register_step3_portfolio.py
  py scripts/notion_register_step3_portfolio.py --project "CoreDXI-Web"
"""

import argparse
import os
import re
import sys
from pathlib import Path

# Windows cp949 터미널 인코딩 문제 방지
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

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

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

NOTION_TOKEN   = os.getenv("NOTION_TOKEN", "")
PROJECTS_DB    = os.getenv("NOTION_PROJECTS_DB_ID", "")
TASKS_DB       = os.getenv("NOTION_TASKS_DB_ID", "")
PORTFOLIO_DB   = os.getenv("NOTION_PORTFOLIO_DB_ID", "")

missing = [k for k, v in {
    "NOTION_TOKEN": NOTION_TOKEN,
    "NOTION_PROJECTS_DB_ID": PROJECTS_DB,
    "NOTION_TASKS_DB_ID": TASKS_DB,
    "NOTION_PORTFOLIO_DB_ID": PORTFOLIO_DB,
}.items() if not v]
if missing:
    print(f"[ERROR] .env 파일에 다음 값이 없습니다: {', '.join(missing)}")
    sys.exit(1)

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
}
W = 72


# ─── Notion API ───────────────────────────────────────────────────────────

def notion_query_db(db_id: str, filter_body: dict = None, start_cursor: str = None) -> dict:
    body: dict = {"page_size": 100}
    if filter_body:
        body["filter"] = filter_body
    if start_cursor:
        body["start_cursor"] = start_cursor
    resp = httpx.post(
        f"https://api.notion.com/v1/databases/{db_id}/query",
        headers=NOTION_HEADERS,
        json=body,
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Notion DB query 실패 ({resp.status_code}): {resp.text[:300]}")
    return resp.json()


def notion_query_all(db_id: str, filter_body: dict = None) -> list:
    results = []
    cursor = None
    while True:
        data = notion_query_db(db_id, filter_body, cursor)
        results.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return results


def notion_create_page(parent_db_id: str, properties: dict) -> dict:
    resp = httpx.post(
        "https://api.notion.com/v1/pages",
        headers=NOTION_HEADERS,
        json={"parent": {"database_id": parent_db_id}, "properties": properties},
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Notion 페이지 생성 실패 ({resp.status_code}): {resp.text[:300]}")
    return resp.json()


# ─── Notion 속성 파싱 ─────────────────────────────────────────────────────

def prop_title(props: dict, key: str) -> str:
    items = props.get(key, {}).get("title", [])
    return items[0]["plain_text"] if items else ""


def prop_rich_text(props: dict, key: str) -> str:
    items = props.get(key, {}).get("rich_text", [])
    return "".join(item.get("plain_text", "") for item in items)


def prop_select(props: dict, key: str) -> str:
    sel = props.get(key, {}).get("select")
    return sel["name"] if sel else ""


def prop_multi_select(props: dict, key: str) -> list[str]:
    return [item["name"] for item in props.get(key, {}).get("multi_select", [])]


def prop_date_start(props: dict, key: str) -> str:
    date_obj = props.get(key, {}).get("date")
    if not date_obj:
        return ""
    return date_obj.get("start", "")[:10]


def prop_relation_ids(props: dict, key: str) -> list[str]:
    return [r["id"] for r in props.get(key, {}).get("relation", [])]


def to_rich_text(text: str) -> list:
    if not text:
        return []
    chunks = []
    for i in range(0, min(len(text), 5400), 1800):
        chunks.append({"text": {"content": text[i : i + 1800]}})
    return chunks


# ─── 데이터 수집 ──────────────────────────────────────────────────────────

def find_project(name: str) -> dict | None:
    pages = notion_query_all(
        PROJECTS_DB,
        filter_body={"property": "프로젝트명", "title": {"equals": name}},
    )
    return pages[0] if pages else None


def find_existing_portfolio(project_id: str) -> list:
    pages = notion_query_all(
        PORTFOLIO_DB,
        filter_body={"property": "프로젝트", "relation": {"contains": project_id}},
    )
    return pages


def fetch_project_tasks(project_id: str) -> list:
    return notion_query_all(
        TASKS_DB,
        filter_body={"property": "프로젝트", "relation": {"contains": project_id}},
    )


def infer_secondary_category(tech_stack: list[str]) -> str:
    joined = " ".join(tech_stack).lower()
    if any(k in joined for k in ["react native", "flutter", "ios", "android", "expo"]):
        return "앱 개발"
    if any(k in joined for k in ["automation", "n8n", "zapier"]):
        return "자동화"
    if any(k in joined for k in ["next.js", "nextjs", "react", "vue", "tailwind", "html"]):
        return "웹 개발"
    return "웹 개발"


def extract_feature_lines(task_titles: list[str], limit: int = 6) -> list[str]:
    """feat 커밋 메시지에서 핵심 기능 목록을 추출합니다."""
    features = []
    seen = set()
    for title in task_titles:
        if not title.lower().startswith("feat:"):
            continue
        label = re.sub(r"^feat:\s*", "", title, flags=re.I).strip()
        label = label.split("(")[0].split("—")[0].split("-")[0].strip()
        if len(label) < 4 or label.lower() in seen:
            continue
        seen.add(label.lower())
        features.append(f"- {label}")
        if len(features) >= limit:
            break
    if not features:
        # feat가 없으면 최근 Task명에서 대체
        for title in task_titles[:limit]:
            clean = re.sub(r"^(feat|fix|refactor|docs|chore):\s*", "", title, flags=re.I).strip()
            if clean:
                features.append(f"- {clean[:60]}")
    return features


def compute_period(tasks: list) -> tuple[str, str]:
    dates = []
    for task in tasks:
        props = task["properties"]
        for key in ("완료 시각", "시작 시각"):
            d = prop_date_start(props, key)
            if d:
                dates.append(d)
    if not dates:
        return "", ""
    dates.sort()
    return dates[0], dates[-1]


def build_drafts(project_props: dict, tasks: list) -> dict:
    summary_line = prop_rich_text(project_props, "한줄 소개")
    summary_line = re.sub(r"^[>\s`*#]+", "", summary_line)
    summary_line = re.sub(r"\*+", "", summary_line).strip()
    structure = prop_rich_text(project_props, "프로젝트 구조")
    libraries = prop_rich_text(project_props, "사용 라이브러리")
    tech_stack = prop_multi_select(project_props, "기술 스택")
    github = project_props.get("깃허브 repo 링크", {}).get("url", "")
    deploy_url = project_props.get("배포 URL", {}).get("url", "")

    task_titles = [prop_title(t["properties"], "Task명") for t in tasks]
    feat_count = sum(1 for t in task_titles if t.lower().startswith("feat:"))
    fix_count = sum(1 for t in task_titles if t.lower().startswith("fix:"))

    tech_str = ", ".join(tech_stack[:8]) if tech_stack else "Next.js, TypeScript, Tailwind CSS"
    live_url = deploy_url or "https://www.coredxi.com"

    project_summary = (
        f"{summary_line or '(주)코어디엑스아이 공식 기업 홈페이지 프로젝트입니다.'}\n"
        f"Next.js 15 App Router 기반으로 공개 마케팅 페이지, 블로그 CMS, 관리자 패널, OAuth 로그인을 구현했습니다.\n"
        f"PostgreSQL(Supabase) + Prisma ORM, NextAuth v5, Resend, GA4, Sentry를 연동해 운영 가능한 B2B 웹사이트를 완성했습니다.\n"
        f"주요 기술 스택: {tech_str}.\n"
        f"실서비스 URL: {live_url}"
    )

    project_purpose = (
        "B2B 기업 (주)코어디엑스아이의 AX(AI 전환) 솔루션과 회의 예약 서비스를 소개하고, "
        "잠재 고객 문의를 받을 수 있는 공식 홈페이지가 필요했습니다. "
        "홍보팀이 코드 없이 콘텐츠를 수정할 수 있도록 CMS와 가이드 문서를 함께 구성했습니다."
    )

    features = extract_feature_lines(task_titles)
    if not features:
        features = [
            "- 공개 마케팅 페이지 (홈, 회사소개, 솔루션, 성공사례, 문의)",
            "- 블로그 CMS (Tiptap 에디터, 카테고리, 이미지 업로드)",
            "- 관리자 패널 (대시보드, 포트폴리오/블로그/문의 관리)",
            "- OAuth 로그인 (Google, Kakao, Naver) 및 이메일 OTP 회원가입",
            "- GA4 분석 대시보드 및 Sentry 에러 모니터링",
        ]
    main_features = "\n".join(features)

    participation = (
        f"기획(PRD/TODO 작성)부터 프론트엔드·백엔드 개발, DB 설계, OAuth 연동, "
        f"블로그 CMS 구축, Vercel 배포까지 전 과정을 AI 협업(바이브 코딩) 방식으로 진행했습니다.\n"
        f"총 {len(tasks)}개 작업(Task) 기록 중 기능 추가 {feat_count}건, 버그 수정 {fix_count}건을 포함합니다.\n"
        f"Next.js 15, Prisma 7, Supabase, NextAuth, Resend, Sentry 등 실무 스택을 직접 연동·운영했습니다."
    )

    return {
        "portfolio_title": prop_title(project_props, "프로젝트명") or "CoreDXI-Web",
        "project_summary": project_summary.strip(),
        "project_purpose": project_purpose.strip(),
        "main_features": main_features.strip(),
        "participation": participation.strip(),
        "secondary_category": infer_secondary_category(tech_stack),
        "tech_stack": tech_stack,
        "github": github,
        "structure_preview": structure[:200] + ("..." if len(structure) > 200 else ""),
        "libraries_preview": libraries[:120] + ("..." if len(libraries) > 120 else ""),
    }


# ─── 미리보기 & 등록 ──────────────────────────────────────────────────────

def print_auto_fields(name: str, project_id: str, period: tuple, drafts: dict):
    start, end = period
    period_str = f"{start} ~ {end}" if start and end else "(Task 날짜 없음)"
    print()
    print("=" * W)
    print("  [1단계] 자동 채움 필드")
    print("=" * W)
    rows = [
        ("포트폴리오 제목", drafts["portfolio_title"]),
        ("프로젝트 relation", f"...{project_id[-8:]}"),
        ("1차 카테고리", "IT·프로그래밍"),
        ("2차 카테고리", drafts["secondary_category"]),
        ("고객사/업종", "개인 프로젝트"),
        ("등록 상태", "초안"),
        ("참여 기간", period_str),
    ]
    for k, v in rows:
        print(f"  {k:<16}: {v}")


def print_draft_table(drafts: dict):
    print()
    print("=" * W)
    print("  [2단계] 글 초안 (등록 전 확인)")
    print("=" * W)
    sections = [
        ("프로젝트 요약", drafts["project_summary"]),
        ("프로젝트 목적", drafts["project_purpose"]),
        ("주요 기능/메뉴", drafts["main_features"]),
        ("참여 내용", drafts["participation"]),
    ]
    for title, body in sections:
        print(f"\n  [{title}]")
        for line in body.splitlines():
            print(f"    {line}")
    print()
    print("=" * W)
    print("  [비워둘 항목] 메인 이미지, 상세 이미지, 노출 서비스, 크몽 등록일, 비승인 사유")
    print("  -> Notion에서 직접 채워주세요.")
    print("=" * W)


def create_portfolio(project_id: str, period: tuple, drafts: dict) -> str:
    start, end = period
    props = {
        "포트폴리오 제목": {
            "title": [{"text": {"content": drafts["portfolio_title"]}}]
        },
        "프로젝트": {
            "relation": [{"id": project_id}]
        },
        "1차 카테고리": {
            "select": {"name": "IT·프로그래밍"}
        },
        "2차 카테고리": {
            "select": {"name": drafts["secondary_category"]}
        },
        "고객사/업종": {
            "rich_text": to_rich_text(drafts.get("client_type", "개인 프로젝트"))
        },
        "등록 상태": {
            "select": {"name": "초안"}
        },
        "프로젝트 요약": {
            "rich_text": to_rich_text(drafts["project_summary"])
        },
        "프로젝트 목적": {
            "rich_text": to_rich_text(drafts["project_purpose"])
        },
        "주요 기능/메뉴": {
            "rich_text": to_rich_text(drafts["main_features"])
        },
        "참여 내용": {
            "rich_text": to_rich_text(drafts["participation"])
        },
    }
    if start:
        date_val: dict = {"start": start}
        if end and end != start:
            date_val["end"] = end
        props["참여 기간"] = {"date": date_val}

    page = notion_create_page(PORTFOLIO_DB, props)
    return page["id"]


def main():
    parser = argparse.ArgumentParser(description="Notion Portfolio 3단계 등록")
    parser.add_argument("--project", default="CoreDXI-Web", help="Projects DB에 등록된 프로젝트명")
    args = parser.parse_args()
    project_name = args.project

    print()
    print("=" * W)
    print("  [3단계] Notion Portfolio 부분 자동화")
    print("=" * W)

    print(f"\n[확인 중] Projects DB에서 '{project_name}' 조회...")
    project_page = find_project(project_name)
    if not project_page:
        print(f"[오류] '{project_name}' 프로젝트를 찾을 수 없습니다.")
        print("  -> 1단계(notion_register_step1.py)를 먼저 실행하세요.")
        sys.exit(1)

    project_id = project_page["id"]
    project_props = project_page["properties"]
    print(f"  -> 프로젝트 ID 확인 (...{project_id[-8:]})")

    existing = find_existing_portfolio(project_id)
    if existing:
        titles = [prop_title(p["properties"], "포트폴리오 제목") for p in existing]
        print(f"\n[주의] 이 프로젝트에 연결된 Portfolio가 이미 {len(existing)}건 있습니다:")
        for t in titles:
            print(f"  - {t or '(제목 없음)'}")
        answer = input("그래도 새 Portfolio 항목을 추가할까요? (y/n): ").strip().lower()
        if answer != "y":
            print("취소했습니다.")
            sys.exit(0)

    print("\n[수집 중] 연결된 Tasks 조회...")
    tasks = fetch_project_tasks(project_id)
    print(f"  -> {len(tasks)}건 Task 발견")

    period = compute_period(tasks)
    drafts = build_drafts(project_props, tasks)

    # 고객사/업종이 개인 프로젝트가 아닐 수 있는 경우 확인
    summary = prop_rich_text(project_props, "한줄 소개").lower()
    if any(kw in summary for kw in ["외주", "고객사", "클라이언트", "납품"]):
        print("\n[확인] 프로젝트 소개에 외주/고객사 관련 표현이 보입니다.")
        client = input("  고객사/업종 값 (기본: 개인 프로젝트): ").strip()
        if client:
            drafts["client_type"] = client
        else:
            drafts["client_type"] = "개인 프로젝트"
    else:
        drafts["client_type"] = "개인 프로젝트"

    print_auto_fields(project_name, project_id, period, drafts)
    print_draft_table(drafts)

    print()
    answer = input("이 초안으로 Portfolio에 등록할까요? (y/n): ").strip().lower()
    if answer != "y":
        print("취소했습니다. 수정이 필요하면 스크립트의 build_drafts() 또는 Notion에서 직접 편집하세요.")
        sys.exit(0)

    print("\n[등록 중] Portfolio DB에 생성 중...")
    try:
        page_id = create_portfolio(project_id, period, drafts)
    except RuntimeError as e:
        print(f"[오류] 등록 실패: {e}")
        sys.exit(1)

    print()
    print("=" * W)
    print("  [완료] Portfolio 1건 등록 완료!")
    print(f"  페이지 ID: ...{page_id[-8:]}")
    print(f"\n  Notion에서 확인:")
    print(f"  https://notion.so/{PORTFOLIO_DB.replace('-', '')}")
    print("\n  [직접 채워주세요] 메인 이미지, 상세 이미지, 노출 서비스, 크몽 등록일")
    print("=" * W)


if __name__ == "__main__":
    main()
