# Amica

![Amica Face](/public/ogp.png)

Amica is an application that allows you to easily converse with 3D characters in your browser.

You can import VRM files, adjust the voice to fit the character, and generate response text that includes emotional expressions.

The various features of Amica mainly use the following technologies:

- 3D Rendering
  - [three.js](https://threejs.org/)
- Displaying 3D characters
  - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- Running Transformers in the browser
  - [Transformers.js](https://huggingface.co/docs/transformers.js/index)
- Speech recognition
  - [Whisper](https://openai.com/research/whisper)
- Voice Activity Detection
  - [Silero VAD](https://github.com/ricky0123/vad/)
- ChatBot
  - [Llama.cpp server](https://github.com/ggerganov/llama.cpp)
  - [ChatGPT API](https://platform.openai.com/docs/api-reference/chat) (compatible with projects such as [LM Studio](https://lmstudio.ai/))
  - [Window.ai](https://windowai.io/)
- Text-to-Speech
  - [Coqui API](https://coqui.ai/)
  - [Eleven Labs API](https://elevenlabs.io/)
  - [Speech T5](https://huggingface.co/microsoft/speecht5_tts)
  - [OpenAI](https://platform.openai.com/docs/guides/text-to-speech)

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

## Documentation

View the [documentation](./docs/README.md) for more information on how to configure and use Amica.

## History

This project originated as a fork of ChatVRM by Pixiv:

[https://pixiv.github.io/ChatVRM](https://pixiv.github.io/ChatVRM)

