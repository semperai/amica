---
title: Using Coqui
order: 9
---

Navigate to [Coqui](https://coqui.ai/) and click on the **Get Started** button.

> Coqui.ai has been discontinued, but enthusiasts can still set up Coqui locally by following the instructions below.

> Coqui Local Branch has not yet been merged.

## Setting Up Coqui Locally

### Method 1: Manual Setup 

1. Create a directory for Coqui and navigate to it:
    ```bash
    mkdir ~/coqui && cd ~/coqui
    ```

2. Download and install Miniconda:
    ```bash
    curl https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh -o miniconda3.sh
    chmod +x ./miniconda3.sh
    ./miniconda3.sh
    ```

3. Create a Conda environment and install Python 3.10:
    ```bash
    conda create --name coqui python=3.10
    conda activate coqui
    ```

4. Clone the Coqui TTS repository:
    ```bash
    git clone https://github.com/coqui-ai/TTS.git
    ```

5. Install dependencies:
    ```bash
    brew install mecab espeak
    pip install numpy==1.21.6 flask_cors
    conda install scipy scikit-learn Cython
    ```

6. Navigate to the cloned `TTS` directory and install Coqui TTS:
    ```bash
    cd TTS && make install
    ```

8. Run the local Coqui TTS server:
    ```bash
    python3 TTS/server/server.py --model_name tts_models/en/vctk/vits
    ```

### Method 2: Setup via Docker

1. Pull the Coqui TTS Docker image:
    ```bash
    docker pull ghcr.io/coqui-ai/tts --platform linux/amd64
    ```

2. Run the Coqui TTS container:
    ```bash
    docker run --rm -it -p 5002:5002 --entrypoint /bin/bash ghcr.io/coqui-ai/tts
    ```

3. Inside the container, install Flask CORS and run the server:
    ```bash
    pip install flask_cors
    python3 TTS/server/server.py --model_name tts_models/en/vctk/vits
    ```

## Adding CORS Support

To ensure that the Coqui server allows cross-origin resource sharing (CORS), add the following lines to Flask app in `/TTS/server/server.py` :

```python
from flask_cors import CORS

CORS(app)
```

## Make sure Coqui is enabled for TTS:

```bash
Settings -> Text-to-Speech -> TTS Backend -> Coqui
```

## Proceed to make a new voice. When you are satisfied, copy the **Voice ID**.

```bash
Settings -> Text-to-Speech -> Coqui -> Voice ID
```

### Notes
- Coqui TTS can be used as a local text-to-speech backend in your application.
- If you want to explore more models or functionalities, refer to the official [Coqui TTS GitHub repository](https://github.com/coqui-ai/TTS).
