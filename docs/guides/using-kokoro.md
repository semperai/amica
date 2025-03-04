---
title: Using Kokoro
order: 16
---

Navigate to [Kokoro TTS GitHub repository](https://github.com/hexgrad/kokoro).

## Setting Up Kokoro TTS Server

### Clone the Repository
```bash
git clone https://github.com/flukexp/kokoro-tts.git
cd kokoro-tts
```

### Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

## Running the Server

### Start the FastAPI Server
```bash
python server.py
```

## Make sure Kokoro is enabled for TTS:

```bash
Settings -> Text-to-Speech -> TTS Backend -> Kokoro
```

## Set the voice

```bash
Settings -> Text-to-Speech -> Kokoro -> Voice
```

## Using Kokoro with OpenAI TTS
You can use Kokoro by choosing OpenAI and configuring your Kokoro endpoint and voice.

### Notes
- Kokoro TTS can be used as a local text-to-speech backend in your application.
- If you want to explore more models or functionalities, refer to the official [Kokoro TTS GitHub repository](https://github.com/hexgrad/kokoro).
