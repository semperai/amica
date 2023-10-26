# ChatVRM

[English](./README.md) | [中文](./README-CN.md) | [日本語](./README-JP.md)

ChatVRM is a demonstration application that allows you to easily converse with 3D characters in your browser.

You can import VRM files, adjust the voice to fit the character, and generate response text that includes emotional expressions.

The various features of ChatVRM mainly use the following technologies:

- User speech recognition
  - [Web Speech API(SpeechRecognition)](https://developer.mozilla.org/ja/docs/Web/API/SpeechRecognition)
- Generating response text
  - [ChatGPT API](https://platform.openai.com/docs/api-reference/chat)
- Generating spoken voice
  - [Koeiro API](http://koeiromap.rinna.jp/)
- Displaying 3D characters
  - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)

## Demo

This project has been published on GitHub Pages for demonstration.

[https://pixiv.github.io/ChatVRM](https://pixiv.github.io/ChatVRM)

## Running

To run this project locally, clone or download the repository.

```bash
git clone git@github.com:pixiv/ChatVRM.git
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

---

# ChatVRM API Documentation

ChatVRM uses the ChatGPT API to generate response messages.

Please refer to the following links and official website to obtain the specifications and terms of use for the ChatGPT API.

- [https://platform.openai.com/docs/api-reference/chat](https://platform.openai.com/docs/api-reference/chat)
- [https://openai.com/policies/api-data-usage-policies](https://openai.com/policies/api-data-usage-policies)

## Koeiro API

ChatVRM uses the Koeiro API for voice reading of response messages.

Please refer to the following links and official website to obtain the specifications and terms of use for the Koeiro API.

- [http://koeiromap.rinna.jp/](http://koeiromap.rinna.jp/)

# Other Documentation

- [https://vrm.dev/](https://vrm.dev/)
- [https://github.com/pixiv/three-vrm](https://github.com/pixiv/three-vrm)
