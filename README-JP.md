# ChatVRM

[English](./README-EN.md) | [中文](./README.md) | [日本語](./README-JP.md)

ChatVRM はブラウザで簡単に 3D キャラクターと会話ができるデモアプリケーションです。

VRM ファイルをインポートしてキャラクターに合わせた声の調整や、感情表現を含んだ返答文の生成などを行うことができます。

ChatVRM の各機能は主に以下の技術を使用しています。

- ユーザーの音声の認識
  - [Web Speech API(SpeechRecognition)](https://developer.mozilla.org/ja/docs/Web/API/SpeechRecognition)
- 返答文の生成
  - [ChatGPT API](https://platform.openai.com/docs/api-reference/chat)
- 読み上げ音声の生成
  - [Koeiro API](http://koeiromap.rinna.jp/)
- 3D キャラクターの表示
  - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)

## デモ

GitHub Pages でデモを公開しています。

[https://pixiv.github.io/ChatVRM](https://pixiv.github.io/ChatVRM)

## 実行

ローカル環境で実行する場合はこのリポジトリをクローンするか、ダウンロードしてください。

```bash
git clone git@github.com:pixiv/ChatVRM.git
```

必要なパッケージをインストールしてください。

```bash
npm install
```

パッケージのインストールが完了した後、以下のコマンドで開発用の Web サーバーを起動します。

```bash
npm run dev
```

実行後、以下の URL にアクセスして動作を確認して下さい。

[http://localhost:3000](http://localhost:3000)

---

## ChatGPT API

ChatVRM では返答文の生成に ChatGPT API を使用しています。

ChatGPT API の仕様や利用規約については以下のリンクや公式サイトをご確認ください。

- [https://platform.openai.com/docs/api-reference/chat](https://platform.openai.com/docs/api-reference/chat)
- [https://openai.com/policies/api-data-usage-policies](https://openai.com/policies/api-data-usage-policies)

## Koeiro API

ChatVRM では返答文の音声読み上げに Koeiro API を使用しています。

Koeiro API の仕様や利用規約については以下のリンクや公式サイトをご確認ください。

- [http://koeiromap.rinna.jp/](http://koeiromap.rinna.jp/)
