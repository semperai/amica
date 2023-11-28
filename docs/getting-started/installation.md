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
