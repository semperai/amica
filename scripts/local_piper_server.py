#!/usr/bin/env python3
"""
Minimal local Piper-compatible HTTP server for Amica.

This is intentionally tiny:
- GET /tts?text=... returns WAV bytes
- CORS headers are enabled for browser fetches
- the server uses Piper's local Python API and voice downloader

The first time you run it for a given voice, Piper downloads the matching
`.onnx` and `.onnx.json` files into the local data directory.
"""

from __future__ import annotations

import io
import json
import os
import wave
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from piper import PiperVoice, SynthesisConfig
from piper.download_voices import download_voice


HOST = os.environ.get("PIPER_HOST", "127.0.0.1")
PORT = int(os.environ.get("PIPER_PORT", "5000"))
PIPER_MODEL = os.environ.get("PIPER_MODEL", "en_US-amy-medium")
PIPER_DATA_DIR = Path(os.environ.get("PIPER_DATA_DIR", Path.home() / ".cache" / "amica-piper"))
PIPER_SPEAKER = int(os.environ.get("PIPER_SPEAKER", "0"))

VOICE = None


def _send_cors(handler: BaseHTTPRequestHandler) -> None:
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "*")


def _ensure_voice() -> PiperVoice:
    global VOICE

    if VOICE is not None:
        return VOICE

    PIPER_DATA_DIR.mkdir(parents=True, exist_ok=True)
    model_path = PIPER_DATA_DIR / f"{PIPER_MODEL}.onnx"
    config_path = PIPER_DATA_DIR / f"{PIPER_MODEL}.onnx.json"

    if not model_path.exists() or not config_path.exists():
        print(
            f"[piper-shim] downloading voice model={PIPER_MODEL!r} "
            f"into {PIPER_DATA_DIR}"
        )
        download_voice(PIPER_MODEL, PIPER_DATA_DIR)

    print(f"[piper-shim] loading voice from {model_path}")
    VOICE = PiperVoice.load(model_path)
    return VOICE


class PiperHandler(BaseHTTPRequestHandler):
    server_version = "AmicaPiperShim/2.0"

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        print(f"[piper-shim] {self.address_string()} - {format % args}")

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        _send_cors(self)
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)

        if parsed.path == "/health":
            payload = json.dumps(
                {
                    "ok": True,
                    "host": HOST,
                    "port": PORT,
                    "model": PIPER_MODEL,
                    "data_dir": str(PIPER_DATA_DIR),
                }
            ).encode("utf-8")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            _send_cors(self)
            self.end_headers()
            self.wfile.write(payload)
            return

        if parsed.path != "/tts":
            self.send_response(HTTPStatus.NOT_FOUND)
            _send_cors(self)
            self.end_headers()
            return

        query = parse_qs(parsed.query)
        text = (query.get("text", [""])[0] or "").strip()
        if not text:
            payload = json.dumps({"error": "missing text query parameter"}).encode("utf-8")
            self.send_response(HTTPStatus.BAD_REQUEST)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            _send_cors(self)
            self.end_headers()
            self.wfile.write(payload)
            return

        print(f"[piper-shim] synthesizing model={PIPER_MODEL!r} text={text!r}")

        try:
            voice = _ensure_voice()
            syn_config = SynthesisConfig(speaker_id=PIPER_SPEAKER)
            with io.BytesIO() as wav_io:
                wav_file = wave.open(wav_io, "wb")
                with wav_file:
                    wav_params_set = False
                    for chunk in voice.synthesize(text, syn_config):
                        if not wav_params_set:
                            wav_file.setframerate(chunk.sample_rate)
                            wav_file.setsampwidth(chunk.sample_width)
                            wav_file.setnchannels(chunk.sample_channels)
                            wav_params_set = True
                        wav_file.writeframes(chunk.audio_int16_bytes)
                audio = wav_io.getvalue()
        except Exception as exc:  # pragma: no cover - runtime path
            print(f"[piper-shim] synthesis failed: {exc}")
            payload = json.dumps(
                {"error": "piper synthesis failed", "detail": str(exc)}
            ).encode("utf-8")
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            _send_cors(self)
            self.end_headers()
            self.wfile.write(payload)
            return

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(audio)))
        _send_cors(self)
        self.end_headers()
        self.wfile.write(audio)


def main() -> None:
    print(
        "[piper-shim] starting on "
        f"http://{HOST}:{PORT} using model={PIPER_MODEL!r} "
        f"data_dir={str(PIPER_DATA_DIR)!r}"
    )
    server = ThreadingHTTPServer((HOST, PORT), PiperHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("[piper-shim] shutting down")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
