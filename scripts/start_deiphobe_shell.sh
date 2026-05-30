#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PIPER_URL="http://127.0.0.1:5000"
AMICA_URL="http://localhost:3000"
PIPER_PID=""
PIPER_STARTED=0

cleanup() {
  if [[ "$PIPER_STARTED" -eq 1 && -n "$PIPER_PID" ]] && kill -0 "$PIPER_PID" 2>/dev/null; then
    echo "Stopping local Piper shim (pid=$PIPER_PID)..."
    kill "$PIPER_PID" 2>/dev/null || true
    wait "$PIPER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

check_piper_health() {
  curl -fsS --max-time 2 "$PIPER_URL/health" >/dev/null 2>&1
}

check_amica_running() {
  curl -fsS --max-time 2 "$AMICA_URL" >/dev/null 2>&1
}

start_piper_if_needed() {
  if check_piper_health; then
    echo "Piper already responding on $PIPER_URL."
    return 0
  fi

  if [[ ! -d "$REPO_ROOT/.venv-piper" ]]; then
    cat <<'EOF'
Piper venv not found at .venv-piper.
Create it first:
  cd ~/ClawDawg/amica
  python3 -m venv .venv-piper
  source .venv-piper/bin/activate
  pip install piper-tts
EOF
    return 1
  fi

  if [[ ! -f "$REPO_ROOT/scripts/local_piper_server.py" ]]; then
    echo "Missing scripts/local_piper_server.py"
    return 1
  fi

  echo "Starting local Piper shim on $PIPER_URL using PIPER_MODEL=${PIPER_MODEL:-en_US-amy-medium}..."
  PIPER_STARTED=1
  "$REPO_ROOT/.venv-piper/bin/python" "$REPO_ROOT/scripts/local_piper_server.py" &
  PIPER_PID=$!

  for _ in $(seq 1 60); do
    if check_piper_health; then
      echo "Piper is ready."
      return 0
    fi

    if ! kill -0 "$PIPER_PID" 2>/dev/null; then
      if curl -fsS --max-time 2 "$PIPER_URL/tts?text=hello" >/dev/null 2>&1; then
        echo "A Piper-compatible server is already using port 5000."
        PIPER_STARTED=0
        return 0
      fi

      echo "Local Piper shim exited unexpectedly. Check the output above."
      return 1
    fi

    sleep 1
  done

  echo "Timed out waiting for Piper to become ready at $PIPER_URL."
  return 1
}

echo "Amica repo: $REPO_ROOT"
cd "$REPO_ROOT"

if check_amica_running; then
  echo "Amica already appears to be running at $AMICA_URL."
else
  echo "Starting Amica dev server..."
fi

start_piper_if_needed

echo "Browser URL: $AMICA_URL"
echo "Settings: ChatBot Backend = Deiphobe | TTS Backend = Piper | Piper URL = $PIPER_URL/tts"

if check_amica_running; then
  echo "Amica is already up."
  if [[ "$PIPER_STARTED" -eq 1 ]]; then
    echo "Keeping the Piper shim alive. Press Ctrl+C to stop it."
    wait "$PIPER_PID" || true
  fi
  exit 0
fi

echo "Running npm run dev..."
npm run dev
