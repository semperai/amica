---
title: How Amica Works
order: 1
---

Read the [Local Setup](./local-setup.md) guide if you are interested in getting everything running locally quickly.

## Importing new Avatars

You can download any VRM file and set it as your avatar in the settings. If you would like this file to persist, you must place the file inside the `public/vrms` folder. You can then set the avatar in the settings.

### Downloading new Avatars

Here are some websites where you can download new avatars:

* [VRCMods](https://vrcmods.com/)
* [VRoid Hub](https://hub.vroid.com)
* [Booth](https://booth.pm)

### Designing new Avatars

You can use [VRoid Studio](https://vroid.com/en/studio) to design your own avatar. You can also use [VRM](https://vrm.dev/en/) to convert your 3D model to VRM format.

## Changing voice

### Elevenlabs

Inside the [VoiceLab](https://elevenlabs.io/voice-lab) click the "Potion" icon to copy the Voice ID. You can then paste this ID into the settings.

### SpeechT5

SpeechT5 in browser uses xvector embeddings. You can select a url from this dataset [here](https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/tree/main) or generate your own xvector embeddings from audio.

### Coqui Studio

Coqui has a public API which allows you to create and clone voices. You can find more information [here](https://docs.coqui.ai/docs).

### OpenAI

OpenAI has a simple TTS service with a simple api. It is pretty opaque. You could choose this to implement a simple API yourself though, like what [basic-openai-api-wrapper](https://github.com/semperai/basic-openai-api-wrapper) does (which uses Coqui local TTS).

## Transcribing your audio

### Whisper (Browser)

This is the default. It runs using transformers.js and works OK, but its a lot slower than running locally.

### Whisper (OpenAI)

This can use OpenAI whisper http endpoint or [basic-openai-api-wrapper](https://github.com/semperai/basic-openai-api-wrapper).

## Running Local LLM

### LM Studio

[LM Studio](https://lmstudio.ai/) can be used to run an OpenAI compatible API. Just install, then click the "Local Server" icon. Ensure CORS is enabled. I recommend installing `TheBloke/dolphin-2.1-mistral-7B-GGUF`.


### llama.cpp server

It is possible to run a local server using [llama.cpp](https://github.com/ggerganov/llama.cpp). This is a bit more involved, but it is possible to run a server with a custom model. This is the recommended way to run a local server.

```
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make server
./server -t 4 -c 4096 -m models/mistral-7b-instruct-v0.1.Q6_K.gguf
```

## System Prompt

You can customize the system prompt to give a specific personality to your avatar. The full information on prompting is out of scope of this document, but the following [guide](https://www.promptingguide.ai/introduction/settings) should help you.


## Designing new plugins

Look at the existing features and how they are implemented. Try to ensure that your code can be enabled and disabled without impacting anything else, and that it can be easily removed if it is not needed. Ideally all features are able to be done with minimal changes to existing code so that we can keep Amica an easy to extend system. Of course, certain features may require more invasive changes to the codebase. If you are unsure, do not worry about submitting PR.
