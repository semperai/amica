# Amica

![Amica Face](/public/intro.png)

Amica is an application that allows you to easily converse with 3D characters in your browser.

You can import VRM files, adjust the voice to fit the character, and generate response text that includes emotional expressions.

The various features of Amica mainly use the following technologies:

- Displaying 3D characters
  - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- Running Transformers in the browser
  - [Transformers.js](https://huggingface.co/docs/transformers.js/index)
- Media Processing
  - [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)
- User speech recognition
  - [Whisper](https://openai.com/research/whisper)
- Generating response text
  - [ChatGPT API](https://platform.openai.com/docs/api-reference/chat)
- Generating spoken voice
  - [Eleven Labs API](https://elevenlabs.io/)

## Running

To run this project locally, clone or download the repository.

```bash
git clone git@github.com:semperai/amica.git
```

Install the required packages.

```bash
npm install
```

After installing the packages, start the development web server using the following command.

```bash
npm run dev
```

Once started, please visit the following URL to confirm that it is working properly.

[http://localhost:3000](http://localhost:3000)

## Local LLM

Set up a local LLM server for testing.

e.g. on mac:
```sh
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install --upgrade --force-reinstall llama-cpp-python --no-cache-dir
python3 -m llama_cpp.server --port 8002 --model models/dolphin-2.0-mistral-7b.Q5_K_M.gguf --n_gpu_layers 35
```

## History

This project originated as a fork of ChatVRM by Pixiv:

[https://pixiv.github.io/ChatVRM](https://pixiv.github.io/ChatVRM)

