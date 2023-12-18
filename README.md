<p align="center">
    <img src="https://amica.arbius.ai/ogp.png" width="600" style="margin-bottom: 0.2;"/>
</p>

<h2 align="center"><a href="https://amica.arbius.ai">Amica: Your friendly personal AI</a></h2>


<h5 align="center"> If you like our project, please give us a star ⭐ on GitHub.</h2>


<h5 align="center">

[![twitter](https://img.shields.io/badge/Twitter%20-black)](https://twitter.com/arbius_ai)
[![License](https://img.shields.io/github/license/semperai/amica)](https://github.com/semperai/amica/blob/main/LICENSE)
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fsemperai%2Famica&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
[![GitHub issues](https://img.shields.io/github/issues/semperai/amica?color=critical&label=Issues)](https://github.com/semperai/amica/issues?q=is%3Aopen+is%3Aissue)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/semperai/amica?color=success&label=Issues)](https://github.com/semperai/amica/issues?q=is%3Aissue+is%3Aclosed)

</h5>

Amica is an application that allows you to easily converse with 3D characters in your browser.

You can import VRM files, adjust the voice to fit the character, and generate response text that includes emotional expressions.

> **For Windows Users**: Please create a new folder for Amica during installation to prevent the unintentional deletion of other files during uninstallation.

<p align="center">
  <a href="https://github.com/semperai/amica/releases/latest">
    <img src="https://img.shields.io/badge/Download%20for%20Windows%20-black?style=for-the-badge&logo=windows" />
  </a>
  <a href="https://github.com/semperai/amica/releases/latest">
    <img src="https://img.shields.io/badge/Download%20for%20Mac%20-black?style=for-the-badge&logo=apple" />
  </a>
  <a href="https://github.com/semperai/amica/releases/latest">
    <img src="https://img.shields.io/badge/Download%20for%20Linux%20-black?style=for-the-badge&logo=linux" />
  </a>
</p>

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
  - [Ollama](https://ollama.ai)
  - [KoboldCpp](https://github.com/LostRuins/koboldcpp)
- Text-to-Speech
  - [Coqui API](https://coqui.ai/)
  - [Eleven Labs API](https://elevenlabs.io/)
  - [Speech T5](https://huggingface.co/microsoft/speecht5_tts)
  - [OpenAI](https://platform.openai.com/docs/guides/text-to-speech)
- Vision
  - [Bakllava](https://github.com/SkunkworksAI/BakLLaVA)

## 🛠️ Installation and running

To run this project locally, clone or download the repository.

```bash
git clone git@github.com:semperai/amica.git
```

Install the required packages.

```bash
npm install
```

After installing the packages, start the development web server using the following command:

```bash
npm run dev
```

Once started, please visit the following URL to confirm that it is working properly.

[http://localhost:3000](http://localhost:3000)

### 📝 Configuration

Most of the configuration is done in the `.env.local` file. Reference the `config.ts` file for the available options.

```bash
amica
├── .env.local
├── src
│   ├── utils
│   │   └── config.ts
```

### 📦 Desktop Application

Amica uses [Tauri](https://tauri.app/) to build the desktop application.

To develop the desktop application, use the following command:

```bash
npm run tauri dev
```

## 📖 Documentation

View the [documentation](https://docs.heyamica.com) for more information on how to configure and use Amica.

## 📜 History

This project originated as a fork of ChatVRM by Pixiv:

[https://pixiv.github.io/ChatVRM](https://pixiv.github.io/ChatVRM)

## 🔒 License
* The majority of this project is released under the MIT license as found in the [LICENSE](https://github.com/semperai/amica/blob/master/LICENSE) file.
* Assets such as 3D models and images are released under their authors respective licenses.


## ✨ Star History
[![Star History](https://api.star-history.com/svg?repos=semperai/amica&type=Date)](https://star-history.com/#semperai/amica&Date)

## 🤗 Contributors

<a href="https://github.com/semperai/amica/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=semperai/amica" />
</a>
