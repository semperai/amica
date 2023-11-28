---
title: Installing Amica
order: 2
---

To run this project locally, clone or download the repository.

```sh
git clone git@github.com:semperai/amica.git
```


Install the required packages.

```sh
npm install
```

After installing the packages, start the development web server using the following command.

```
npm run dev
```

## Adding new Assets

Make sure to run `npm run generate:paths` after adding new assets, and `npm run build` to see your new files.

### Background

New background images can be places in `./public/bg/.private` and will be automatically loaded.

### VRM

New VRM files can be placed in `./public/vrm/.private` and will be automatically loaded.

### Animation

New animation files can be placed in `./public/animation/.private` and will be automatically loaded.

## Setup LLM, TTS and STT

### Local LLM Setup

We will use llama.cpp for local LLM. However, you can see how to do this with other LLMs with the various guides.

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make server -j 4

# download https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF/blob/main/openhermes-2.5-mistral-7b.Q5_K_M.gguf
# save this file into llama.cpp/models folder

# when the download is complete you can start the server and load the model
# you can save this command in a file called start_server.sh
./server -t 4 -c 4096 -ngl 35 -b 512 --mlock -m models/openhermes-2-mistral-7b.Q5_K_M.gguf
```

Now go to [http://127.0.0.1:8080](http://127.0.0.1:8080) in browser and test it works.


### Local Audio

We will use a simple http server which implements [Coqui TTS](https://github.com/coqui-ai/TTS) and [faster-whisper](https://github.com/guillaumekln/faster-whisper) with api endpoints matching OpenAIs.

```bash
git clone https://github.com/semperai/basic-openai-api-wrapper
cd basic-openai-api-wrapper
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python server.py
```

Now you have OpenAI compatible transcription and TTS server running on 127.0.0.1:5000.

Now, configure settings to use local services:

```markdown
settings -> chatbot -> chatbot backend:
    set `Chatbot Backend` to `llama.cpp`

settings -> chatbot -> llama.cpp:
    set `API URL` to `http://127.0.0.1:8080`

settings -> text-to-speech -> tts backend:
    set `TTS Backend` to `OpenAI TTS`

settings -> text-to-speech -> openai:
    set `API URL` to `http://127.0.0.1:5000`

settings -> speech-to-text -> stt backend:
    set `STT Backend` to `Whisper (OpenAI)`

settings -> speech-to-text -> whisper (openai):
    set `OpenAI URL` to `http://127.0.0.1:5000`
```

Test that everything works. If something doesn't, open the debug window or your developer console in web browser to see if you can see what the error is.


## Configuring Deployment


The following environment variables may be set to configure the application:

* `NEXT_PUBLIC_BG_URL` - The URL of the background image.
* `NEXT_PUBLIC_VRM_URL` - The URL of the VRM file.
* `NEXT_PUBLIC_YOUTUBE_VIDEOID` - The ID of the YouTube video.
* `NEXT_PUBLIC_ANIMATION_URL` - The URL of the animation file.
* `NEXT_PUBLIC_CHATBOT_BACKEND` - The backend to use for chatbot. Valid values are `echo`, `openai`, `llamacpp`, `ollama`, and `koboldai` 
* `NEXT_PUBLIC_OPENAI_APIKEY` - The API key for OpenAI.
* `NEXT_PUBLIC_OPENAI_URL` - The URL of the OpenAI API.
* `NEXT_PUBLIC_OPENAI_MODEL` - The model to use for OpenAI.
* `NEXT_PUBLIC_LLAMACPP_URL` - The URL of the LlamaCPP API.
* `NEXT_PUBLIC_OLLAMA_URL` - The URL of the Ollama API.
* `NEXT_PUBLIC_OLLAMA_MODEL` - The model to use for Ollama.
* `NEXT_PUBLIC_KOBOLDAI_URL` - The URL of the KoboldAI API.
* `NEXT_PUBLIC_KOBOLDAI_USE_EXTRA` - Whether to use extra api for KoboldAI (KoboldCpp).
* `NEXT_PUBLIC_TTS_BACKEND` - The backend to use for TTS. Valid values are `none`, `openai_tts`, `elevenlabs`, `coqui`, and `speecht5`
* `NEXT_PUBLIC_STT_BACKEND` - The backend to use for STT. Valid values are `none`, `whisper_browser`, `whispercpp`, and `whispercpp_server`
* `NEXT_PUBLIC_VISION_BACKEND` - The backend to use for vision. Valid values are `none`, and `llamacpp`
* `NEXT_PUBLIC_VISION_SYSTEM_PROMPT` - The system prompt to use for vision.
* `NEXT_PUBLIC_VISION_LLAMACPP_URL` - The URL of the LlamaCPP API.
* `NEXT_PUBLIC_WHISPERCPP_URL` - The URL of the WhisperCPP API.
* `NEXT_PUBLIC_OPENAI_WHISPER_APIKEY` - The API key for OpenAI.
* `NEXT_PUBLIC_OPENAI_WHISPER_URL` - The URL of the OpenAI API.
* `NEXT_PUBLIC_OPENAI_WHISPER_MODEL` - The model to use for OpenAI.
* `NEXT_PUBLIC_OPENAI_TTS_APIKEY` - The API key for OpenAI.
* `NEXT_PUBLIC_OPENAI_TTS_URL` - The URL of the OpenAI API.
* `NEXT_PUBLIC_OPENAI_TTS_MODEL` - The model to use for OpenAI.
* `NEXT_PUBLIC_ELEVENLABS_APIKEY` - The API key for Eleven Labs.
* `NEXT_PUBLIC_ELEVENLABS_VOICEID` - The voice ID to use for Eleven Labs.
* `NEXT_PUBLIC_ELEVENLABS_MODEL` - The model to use for Eleven Labs.
* `NEXT_PUBLIC_SPEECHT5_SPEAKER_EMBEDDING_URL` - The URL of the speaker embedding file for SpeechT5.
* `NEXT_PUBLIC_COQUI_APIKEY` - The API key for Coqui.
* `NEXT_PUBLIC_COQUI_VOICEID` - The voice ID to use for Coqui.
* `NEXT_PUBLIC_SYSTEM_PROMPT` - The system prompt to use for OpenAI.
