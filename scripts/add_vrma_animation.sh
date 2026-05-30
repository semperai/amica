#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ $# -ne 1 ]]; then
  cat <<'EOF'
Usage:
  scripts/add_vrma_animation.sh <path-to-vrma>

Copies a local .vrma file into public/animations, refreshes Amica's asset
registry, and prints a one-shot animation curl payload for testing.
EOF
  exit 1
fi

SOURCE_PATH="$1"

if [[ ! -f "$SOURCE_PATH" ]]; then
  echo "Error: file not found: $SOURCE_PATH" >&2
  exit 1
fi

if [[ "${SOURCE_PATH##*.}" != "vrma" ]]; then
  echo "Error: expected a .vrma file: $SOURCE_PATH" >&2
  exit 1
fi

if [[ ! -d "$REPO_ROOT/public/animations" ]]; then
  echo "Error: missing target folder: $REPO_ROOT/public/animations" >&2
  exit 1
fi

SOURCE_NAME="$(basename "$SOURCE_PATH")"
SAFE_NAME="$SOURCE_NAME"
SAFE_NAME="${SAFE_NAME// /_}"
SAFE_NAME="${SAFE_NAME//[^A-Za-z0-9._-]/_}"

DEST_PATH="$REPO_ROOT/public/animations/$SAFE_NAME"

if [[ -e "$DEST_PATH" ]]; then
  echo "Error: destination already exists: $DEST_PATH" >&2
  exit 1
fi

cp "$SOURCE_PATH" "$DEST_PATH"
echo "Copied to: $DEST_PATH"

cd "$REPO_ROOT"
npm run generate:paths

echo
echo "One-shot test payload:"
cat <<EOF
curl -sS -i -X POST http://localhost:3000/api/amicaHandler/ \\
  -H 'Content-Type: application/json' \\
  -d '{
    "inputType":"Reasoning Server",
    "payload":{
      "text":"Triggering a test animation.",
      "socialMedia":"none",
      "playback":false,
      "animation":"$SAFE_NAME",
      "reprocess":false
    }
  }'
EOF
