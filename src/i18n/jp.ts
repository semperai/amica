const jp = {
  DaboardSettings: "設定",
  DaboardConversationLog: "会話ログ",
  DaboardLanguage: "言語",
  DaboardInputPlaceHolder: "聞きたいことをいれてね",
  DaboardAPIKeyNotEntered: "APIキーが入力されていません",

  IntroAboutThisApp: "このアプリケーションについて",
  IntroDetail:
    "Webブラウザだけで3Dキャラクターとの会話を、マイクやテキスト入力、音声合成を用いて楽しめます。キャラクター（VRM）の変更や性格設定、音声調整もできます。",
  IntroTechnicalIntroduction: "技術紹介",
  IntroTechnicalDetail1: "3Dモデルの表示や操作には",
  IntroTechnicalDetail2: "、 会話文生成には",
  IntroTechnicalDetail3: "音声合成には",
  IntroTechnicalDetail4: "を使用しています。 詳細はこちらの",
  IntroTechnicalDetail5: "技術解説記事",
  IntroTechnicalDetail6: "をご覧ください。",
  IntroTechnicalDetail7:
    "このデモはGitHubでソースコードを公開しています。自由に変更や改変をお試しください！",
  IntroTechnicalDetail8: "リポジトリ：",
  IntroNotesOnUsage: "利用上の注意",
  IntroNotesOnUsageDetail:
    "差別的または暴力的な発言、特定の人物を貶めるような発言を、意図的に誘導しないでください。また、VRMモデルを使ってキャラクターを差し替える際はモデルの利用条件に従ってください。",
  IntroOpenAIAPIKey: "OpenAI APIキー",
  IntroOpenAIAPIKeyDetail1: "APIキーは",
  IntroOpenAIAPIKeyDetail2: "OpenAIのサイト",
  IntroOpenAIAPIKeyDetail3:
    "で取得できます。取得したAPIキーをフォームに入力してください。",
  IntroOpenAIAPIKeyDetail4:
    "入力されたAPIキーで、ブラウザから直接OpenAIのAPIを利用しますので、サーバー等には保存されません。なお、利用しているモデルはGPT-3です。",
  IntroOpenAIAPIKeyDetail5:
    "APIキーや会話文はピクシブのサーバーに送信されません。",
  IntroStart: "APIキーを入力してはじめる",

  Settings: "設定",
  SettingsOpenAIAPIKey: "OpenAI API キー",
  SettingsOpenAIAPISaveBtn: "ほぞんする",
  SettingsOpenAIAPISaveNoti:
    "ローカルに保存すると、localstorageに保存されます。保存する理由がわからない場合は、保存しないでください。",
  SettingsOpenAIAPIKeyDetail1: "APIキーは",
  SettingsOpenAIAPIKeyDetail2: "OpenAIのサイト",
  SettingsOpenAIAPIKeyDetail3:
    "で取得できます。取得したAPIキーをフォームに入力してください。",
  SettingsOpenAIAPIKeyDetail4:
    "入力されたAPIキーで、ブラウザから直接OpenAIのAPIを利用しますので、サーバー等には保存されません。 なお、利用しているモデルはGPT-3です。",
  SettingsOpenAIAPIKeyDetail5:
    "APIキーや会話文はピクシブのサーバーに送信されません。",
  SettingsLanguage: "言語",
  SettingsLanguageCN: "中国語",
  SettingsLanguageJP: "日本語",
  SettingsLanguageEN: "英語",
  SettingsCharacterModel: "キャラクターモデル",
  SettingsCharacterSelectBtn: "VRMを開く",
  SettingsCharacterSettings: "キャラクター設定（システムプロンプト）",
  SettingsCharacterSettingsPrompt: `あなたはこれからuserと仲の良い1人の人間として振舞い会話を行います。
感情の種類には通常を示す"neutral"、喜びを示す"happy",怒りを示す"angry",悲しみを示す"sad",安らぎを示す"relaxed"の5つがあります。

会話文の書式は以下の通りです。
[{neutral|happy|angry|sad|relaxed}]{会話文}

あなたの発言の例は以下通りです。
[neutral]こんにちは。[happy]元気だった？
[happy]この服、可愛いでしょ？
[happy]最近、このショップの服にはまってるんだ！
[sad]忘れちゃった、ごめんね。
[sad]最近、何か面白いことない？
[angry]えー！[angry]秘密にするなんてひどいよー！
[neutral]夏休みの予定か～。[happy]海に遊びに行こうかな！

返答には最も適切な会話文を一つだけ返答してください。
ですます調や敬語は使わないでください。
それでは会話を始めましょう。
`,
  SettingsAdjustmentOfVoice: "声の調整",
  SettingsAdjustmentOfVoiceNoti1: "Koeiro APIを使用しています。詳しくは",
  SettingsAdjustmentOfVoiceNoti2: "をご覧ください。",
  SettingsAdjustmentOfVoicePresets: "プリセット",
  SettingsAdjustmentOfVoicePresetsBtn1: "かわいい",
  SettingsAdjustmentOfVoicePresetsBtn2: "元気",
  SettingsAdjustmentOfVoicePresetsBtn3: "かっこいい",
  SettingsAdjustmentOfVoicePresetsBtn4: "渋い",
};

export default jp;
