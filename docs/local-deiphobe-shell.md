---
title: Local Deiphobe Shell
---

This launcher starts the local Amica + Deiphobe development shell and brings up the Piper shim if it is not already running.

## Setup

1. Make sure the Amica repo is available:
   ```bash
   cd ~/ClawDawg/amica
   ```

2. Create the local Piper virtualenv once:
   ```bash
   python3 -m venv .venv-piper
   source .venv-piper/bin/activate
   pip install piper-tts
   ```

3. Keep the default local voice:
   - `PIPER_MODEL=en_US-amy-medium`

## One-Command Startup

Preferred:
```bash
cd ~/ClawDawg/amica
npm run dev:deiphobe
```

Equivalent:
```bash
cd ~/ClawDawg/amica
bash scripts/start_deiphobe_shell.sh
```

What it does:
- Starts the Piper shim on `http://127.0.0.1:5000` if needed
- Starts the Amica dev server
- Prints the browser URL: `http://localhost:3000`
- Leaves an existing Piper service alone
- Cleans up the Piper child process if the launcher started it

## Expected Settings

In the Amica UI:
- `ChatBot Backend = Deiphobe`
- `TTS Backend = Piper`
- `Piper URL = http://127.0.0.1:5000/tts`

SpeechT5 stays available as the fallback backend.

## Troubleshooting

### Port 5000 already in use
- Another Piper-compatible server is already running, or something else is bound to the port.
- The launcher will not kill it.
- If Amica still cannot speak, check the service at `http://127.0.0.1:5000/health`.

### `.venv-piper` is missing
- Create it first:
  ```bash
  cd ~/ClawDawg/amica
  python3 -m venv .venv-piper
  source .venv-piper/bin/activate
  pip install piper-tts
  ```

### `npm run dev` is already running
- Stop the existing Amica dev server before starting the launcher again.
- The browser URL remains `http://localhost:3000`.

### Browser URL
- Open `http://localhost:3000`

