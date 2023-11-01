# Amica Documentation


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

## Running Local LLM

### LM Studio

[LM Studio](https://lmstudio.ai/) can be used to run an OpenAI compatible API. Just install, then click the "Local Server" icon. Ensure CORS is enabled. I recommend installing `TheBloke/dolphin-2.1-mistral-7B-GGUF`.


### llama.cpp server

```
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make server
./server -t 4 -c 4096 -m models/mistral-7b-instruct-v0.1.Q6_K.gguf
cd examples/server
# ensure you have cors enabled on server
python3 api_like_OAI.py
```

## System Prompt

You can customize the system prompt to give a specific personality to your avatar. The full information on prompting is out of scope of this document, but the following [guide](https://www.promptingguide.ai/introduction/settings) should help you.


## Designing new plugins

Look at the existing features and how they are implemented. Try to ensure that your code can be enabled and disabled without impacting anything else, and that it can be easily removed if it is not needed. Ideally all features are able to be done with minimal changes to existing code so that we can keep Amica an easy to extend system. Of course, certain features may require more invasive changes to the codebase. If you are unsure, do not worry about submitting PR.
