---
title: Using AllTalk
order: 14
---

Navigate to [AllTalk](https://github.com/erew123/alltalk_tts) and follow the instructions below to set up AllTalk using Docker or manually.

## Setting Up AllTalk Locally

### Method 1: Manual Setup 

For manual setup, follow the official instructions provided [here](https://github.com/erew123/alltalk_tts/blob/main/README.md#-manual-installation---as-a-standalone-application).

1. Clone the AllTalk repository:
    ```bash
    git clone https://github.com/erew123/alltalk_tts.git
    cd alltalk_tts
    ```
    
2. Create conda environment and activated it:
    ```bash
    conda create --name alltalkenv python=3.11.5
    conda activate alltalkenv
    ```

3. Install the required dependencies:
    ```bash
    pip install -r system/requirements/requirements_standalone.txt
    ```

4. Run the AllTalk server:
    ```bash
    python script.py
    ```

5. Access the server at `localhost:7851`.

### Method 2: Setup via Docker

1. Pull the AllTalk Docker image:
    ```bash
    docker pull flukexp/alltalkenv
    ```

2. Run the AllTalk Docker container:
    ```bash
    docker run -d -p 7851:7851 --name alltalk-server flukexp/alltalkenv
    ```

3. The server will be available at `localhost:7851`.

## Make sure AllTalk is enabled for TTS:

```bash
Settings -> Text-to-Speech -> TTS Backend -> AllTalk
```

### Notes
- AllTalk can be used as a local text-to-speech backend in your application.
- For further details, refer to the official [AllTalk GitHub repository](https://github.com/erew123/alltalk_tts).