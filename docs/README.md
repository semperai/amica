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

### llama.cpp server

[abetlen/llama-cpp-python](https://github.com/abetlen/llama-cpp-python) is a nice program which exposes an OpenAI compatible API.

For building an optimized version on macOS, you can use the following commands:

```sh
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
python3 -m llama_cpp.server --port 8002 --model models/llama-2-7b.Q5_K_M.gguf --n_gpu_layers 35
```

## System Prompt

You can customize the system prompt to give a specific personality to your avatar. The full information on prompting is out of scope of this document, but the following [guide](https://www.promptingguide.ai/introduction/settings) should help you.


## Designing new plugins

Look at the existing features and how they are implemented. Try to ensure that your code can be enabled and disabled without impacting anything else, and that it can be easily removed if it is not needed. Ideally all features are able to be done with minimal changes to existing code so that we can keep Amica an easy to extend system. Of course, certain features may require more invasive changes to the codebase. If you are unsure, do not worry about submitting PR.
