# ChatVRM

[English](./README.md) | [中文](./README-CN.md) | [日本語](./README-JP.md)

ChatVRM 是一个演示应用程序，可以在浏览器中轻松地与 3D 角色进行对话。

您可以导入 VRM 文件，调整声音以适应角色，并生成包含情感表达的回答文本等。

ChatVRM 的各种功能主要使用以下技术：

- 用户语音识别
  - [Web Speech API(SpeechRecognition)](https://developer.mozilla.org/ja/docs/Web/API/SpeechRecognition)
- 回答文本的生成
  - [ChatGPT API](https://platform.openai.com/docs/api-reference/chat)
- 生成朗读语音
  - [Koeiro API](http://koeiromap.rinna.jp/)
- 显示 3D 角色
  - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)

## Demo

该项目已在 GitHub Pages 上发布了演示。

[https://pixiv.github.io/ChatVRM](https://pixiv.github.io/ChatVRM)

## 运行

如果要在本地运行该项目，请克隆或下载该存储库。

```bash
git clone git@github.com:pixiv/ChatVRM.git
```

安装所需的软件包

```bash
npm install
```

安装软件包后，使用以下命令启动 Web 服务器。

```bash
npm run dev
```

启动后，请访问以下网址以确认其是否正常工作。

[http://localhost:3000](http://localhost:3000)

---

# ChatVRM API 文档

ChatVRM 使用 ChatGPT API 生成响应消息。

请参考以下链接和官方网站以获取 ChatGPT API 的规格和使用条款。

- [https://platform.openai.com/docs/api-reference/chat](https://platform.openai.com/docs/api-reference/chat)
- [https://openai.com/policies/api-data-usage-policies](https://openai.com/policies/api-data-usage-policies)

## Koeiro API

ChatVRM 使用 Koeiro API 进行响应消息的语音阅读。

请参考以下链接和官方网站以获取 Koeiro API 的规格和使用条款。

- [http://koeiromap.rinna.jp/](http://koeiromap.rinna.jp/)

# 其它文档

- [https://vrm.dev/](https://vrm.dev/)
- [https://github.com/pixiv/three-vrm](https://github.com/pixiv/three-vrm)
