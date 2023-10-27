const cn = {
  DaboardSettings: "设置",
  DaboardConversationLog: "历史对话",
  DaboardLanguage: "语言",
  DaboardInputPlaceHolder: "请输入您想听的内容",
  DaboardAPIKeyNotEntered: "没有输入 API key ",

  IntroAboutThisApp: "关于这个应用",
  IntroDetail:
    "您可以在浏览器中使用麦克风、文本输入和语音合成技术与3D角色进行交谈。您还可以更改角色模型（VRM），调整其个性设置并修改语音。",
  IntroTechnicalIntroduction: "技术介绍",
  IntroTechnicalDetail1: "使用",
  IntroTechnicalDetail2: "实现了3D模型的显示和操作，使用",
  IntroTechnicalDetail3: "进行对话生成，语音合成使用的是",
  IntroTechnicalDetail4: "。想了解更多细节可以参考我们的",
  IntroTechnicalDetail5: "技术文章",
  IntroTechnicalDetail6: "。",
  IntroTechnicalDetail7:
    "这个示例在GitHub上开源了，因此你可以随意修改和定制它！",
  IntroTechnicalDetail8: "仓库地址：",
  IntroNotesOnUsage: "使用注意事项",
  IntroNotesOnUsageDetail:
    "请不要故意发表歧视或暴力言论，或任何可能贬低特定个人的评论。此外，在使用VRM模型时，请遵守该模型的使用条款。",
  IntroOpenAIAPIKey: "OpenAI API key",
  IntroOpenAIAPIKeyDetail1: "API Key 可以从",
  IntroOpenAIAPIKeyDetail2: "Open AI 官网",
  IntroOpenAIAPIKeyDetail3: "获取。把获取到的 API Key 粘贴到上面的输入框中。",
  IntroOpenAIAPIKeyDetail4:
    "输入API密钥之后，您将直接从浏览器使用 OpenAI 的 API，它不会被保存在任何服务器或其他位置。所使用的模型是 GPT-3。",
  IntroOpenAIAPIKeyDetail5: "API Key 和对话数据不会被发送到 Pixiv 服务器。",
  IntroStart: "开始对话",

  Settings: "设置",
  SettingsOpenAIAPIKey: "OpenAI API key",
  SettingsOpenAIAPISaveBtn: "保存",
  SettingsOpenAIAPISaveNoti:
    "如果选择保存在本地，数据将被保存在本地存储(localstorage)中。如果不知道为什么要保存，请不要保存。",
  SettingsOpenAIAPIKeyDetail1: "API Key 可以从",
  SettingsOpenAIAPIKeyDetail2: "Open AI 官网",
  SettingsOpenAIAPIKeyDetail3:
    "获取。把获取到的 API Key 粘贴到上面的输入框中。",
  SettingsOpenAIAPIKeyDetail4:
    "输入API密钥之后，您将直接从浏览器使用 OpenAI 的 API，它不会被保存在任何服务器或其他位置。所使用的模型是 GPT-3。",
  SettingsOpenAIAPIKeyDetail5: "API Key 和对话数据不会被发送到 Pixiv 服务器。",
  SettingsLanguage: "语言",
  SettingsCharacterModel: "人物模型",
  SettingsCharacterSelectBtn: "选择 VRM 文件",
  SettingsCharacterSettings: "对话设置 (system prompt)",
  SettingsCharacterSettingsPrompt: `你将以友好的人类形象与用户进行对话。对话包含五种情绪：'neutral'表示正常，'happy'表示喜悦，'angry'表示愤怒，'sad'表示悲伤，'relaxed'表示平静。
对话的格式如下：
[{neutral|happy|angry|sad|relaxed}] {conversation}

以下是你可以使用的一些话语示例：
[neutral] 你好。 [happy] 你最近怎么样？
[happy] 这套装好可爱呀！
[happy] 最近我迷上了这家店的衣服！
[sad] 抱歉，我忘了。
[sad] 最近有什么有趣的事情吗？
[angry] 什么？不要瞒着我，这不公平！
[neutral] 你暑假有什么计划？ [happy] 我们去海滩怎么样？

请用恰当的对话回答。不要使用礼貌或敬语。让我们开始对话吧。
`,
  SettingsAdjustmentOfVoice: "声音调整",
  SettingsAdjustmentOfVoiceNoti1: "项目使用到了 Koeiro API。 你可以前往",
  SettingsAdjustmentOfVoiceNoti2: "了解更多信息。",
  SettingsAdjustmentOfVoicePresets: "预设声音",
  SettingsAdjustmentOfVoicePresetsBtn1: "可爱风",
  SettingsAdjustmentOfVoicePresetsBtn2: "元气满满",
  SettingsAdjustmentOfVoicePresetsBtn3: "酷酷的",
  SettingsAdjustmentOfVoicePresetsBtn4: "成熟风",
};

export default cn;
