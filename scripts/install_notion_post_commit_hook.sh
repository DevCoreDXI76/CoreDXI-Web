#!/bin/sh
# Notion post-commit 훅 설치 스크립트 (Git Bash / macOS / Linux)
# Windows PowerShell에서는 Git Bash에서 실행: bash scripts/install_notion_post_commit_hook.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_SRC="$ROOT/scripts/post-commit.hook"
HOOK_DST="$ROOT/.git/hooks/post-commit"

if [ ! -d "$ROOT/.git/hooks" ]; then
  echo "[오류] .git/hooks 폴더가 없습니다. git init 상태를 확인하세요."
  exit 1
fi

cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "[완료] post-commit 훅 설치: $HOOK_DST"
echo "  .env에 NOTION_TOKEN, NOTION_TASKS_DB_ID, NOTION_PROJECT_PAGE_ID가 설정되어 있어야 합니다."
