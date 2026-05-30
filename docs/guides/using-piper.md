---
title: Using Piper
order: 13
---

Navigate to [Piper](https://github.com/rhasspy/piper) and follow the setup instructions below to run Piper locally as a TTS backend.

## Setting Up Piper Locally

### Fastest Local WSL Path

If you just want a browser-safe local HTTP server for Amica, use the small shim in this repo.

1. Create a venv for Piper and install the Piper CLI:
    ```bash
    cd ~/ClawDawg/amica
    python3 -m venv .venv-piper
    source .venv-piper/bin/activate
    pip install piper-tts
    ```

2. Start the local Piper-compatible HTTP server:
    ```bash
    python scripts/local_piper_server.py
    ```

3. Point Amica at the local endpoint:
    ```text
    Settings -> Text-to-Speech -> TTS Backend -> Piper
    Settings -> Text-to-Speech -> Piper -> URL = http://127.0.0.1:5000/tts
    ```

4. Optional voice tuning:
    - Set `PIPER_MODEL=en_US-lessac-medium` or another Piper voice before starting the server.
    - The shim sends CORS headers and returns `audio/wav`, so browser fetches work without a separate proxy.

5. Quick test:
    ```bash
    curl -o /tmp/piper-test.wav "http://127.0.0.1:5000/tts?text=hello"
    file /tmp/piper-test.wav
    ```

6. Keep SpeechT5 as a fallback:
    - If the Piper server is down, switch Amica back to `SpeechT5` in the TTS backend selector.

### Method 1: Setup via Docker

1. Clone the artibex/piper repository:
    ```bash
    git clone git@github.com:artibex/piper-http.git
    ```

2. Navigate to the `piper-http` directory:
    ```bash
    cd piper-http
    ```

3. Add CORS support by installing Flask CORS in the Dockerfile. To do this, locate the Dockerfile and add the following line:
    ```bash
    RUN pip install flask_cors
    ```

4. Build the Piper Docker image:
    ```bash
    docker build -t http-piper .
    ```

5. Run the Piper Docker container:
    ```bash
    docker run --name piper -p 5000:5000 piper
    ```

6. To allow CORS within the Piper server, modify the `http_server.py` file inside the running Docker container:

    - Navigate to the `piper-http` container's files:
      ```bash
      docker exec -it piper /bin/bash
      ```
    - Locate the `http_server.py` file:
      ```bash
      cd /app/piper/src/python_run/piper
      ```
    - Edit `http_server.py` and add the following lines at the top to enable CORS:
      ```python
      from flask_cors import CORS
      CORS(app)
      ```

7. Save the changes and restart the Piper server inside the container:
    ```bash
    python3 http_server.py
    ```

### Method 2: Manual Setup 

1. Clone the repository:
    ```bash
    git clone https://github.com/flukexp/PiperTTS-API-Wrapper.git
    ```

2. Navigate to the project directory:
    ```bash
    cd PiperTTS-API-Wrapper
    ```

4. Download piper, install Piper sample voices and start piper server:
    ```bash
    ./piper_installer.sh
    ```

## Make sure Piper is enabled for TTS:

```bash
Settings -> Text-to-Speech -> TTS Backend -> Piper
```

### Notes
- Piper can be used as a local text-to-speech backend in your application.
- For more details on models and configurations, refer to the official [Piper GitHub repository](https://github.com/rhasspy/piper).
