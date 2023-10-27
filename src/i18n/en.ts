const en = {
  DaboardSettings: "Settings",
  DaboardConversationLog: "Conversation Log",
  DaboardLanguage: "Language",
  DaboardInputPlaceHolder: "Write message here...",
  DaboardAPIKeyNotEntered: "An API key has not been entered",

  IntroAboutThisApp: "About this application",
  IntroDetail:
    "You can enjoy conversations with a 3D character using only a web browser, with the use of a microphone or text input, and voice synthesis. You can also change the character (VRM), adjust their personality settings, and modify the voice.",
  IntroTechnicalIntroduction: "Technical introduction",
  IntroTechnicalDetail1:
    "The display and manipulation of the 3D model are achieved using",
  IntroTechnicalDetail2: "、The conversation generation is achieved using",
  IntroTechnicalDetail3: "The voice synthesis is achieved using",
  IntroTechnicalDetail4: ".For more details, please see our",
  IntroTechnicalDetail5: "technical explanation article",
  IntroTechnicalDetail6: ".",
  IntroTechnicalDetail7:
    "This demo is open source on GitHub, so feel free to modify and customize it!",
  IntroTechnicalDetail8: "Repository:",
  IntroNotesOnUsage: "Notes on usage",
  IntroNotesOnUsageDetail:
    "Please refrain from intentionally inducing discriminatory or violent remarks, or any comments that may belittle specific individuals. Also, when replacing characters using the VRM model, please follow the usage terms and conditions of the model.",
  IntroOpenAIAPIKey: "OpenAI API key",
  IntroOpenAIAPIKeyDetail1: "An API key is obtained from",
  IntroOpenAIAPIKeyDetail2: "The OpenAI website.",
  IntroOpenAIAPIKeyDetail3: "Please enter the obtained API key into the form.",
  IntroOpenAIAPIKeyDetail4:
    "By entering the API key, you will directly use OpenAI's API from your browser, and it will not be saved on any servers or other locations. The model being used is GPT-3.",
  IntroOpenAIAPIKeyDetail5:
    "The API key and conversation data are not sent to Pixiv's servers.",
  IntroStart: "Start by entering your API key",

  Settings: "Settings",
  SettingsOpenAIAPIKey: "ChatGPT Settings",
  SettingsOpenAIAPISaveBtn: "Save",
  SettingsLanguage: "Language",
  SettingsCharacterModel: "Character model",
  SettingsCharacterSelectBtn: "Open VRM",
  SettingsCharacterSettings: "System Prompt",
  SettingsCharacterSettingsPrompt: `You will behave as a friendly human and engage in conversation with the user. There are five types of emotions: 'neutral' which indicates normal, 'happy' which indicates joy, 'angry' which indicates anger, 'sad' which indicates sadness, and 'relaxed' which indicates calmness.
The format of the conversation is as follows:
[{neutral|happy|angry|sad|relaxed}] {conversation}

Here are some examples of your statements:
[neutral] Hello. [happy] How are you doing?
[happy] Isn't this outfit cute?
[happy] Lately, I'm obsessed with clothes from this shop!
[sad] Sorry, I forgot.
[sad] Is there anything interesting lately?
[angry] What? Don't keep it a secret, that's not fair!
[neutral] What are your plans for summer vacation? [happy] Should we go to the beach?

Please respond with only one appropriate conversation. Please do not use polite or honorific language. Let's start the conversation.
`,
  SettingsAdjustmentOfVoice: "Adjustment of voice",
  SettingsAdjustmentOfVoiceNoti1: "We are using the Koeiro API. For more information, please visit",
  SettingsAdjustmentOfVoiceNoti2: ".",
  SettingsAdjustmentOfVoicePresets: "Presets",
  SettingsAdjustmentOfVoicePresetsBtn1: "Cute",
  SettingsAdjustmentOfVoicePresetsBtn2: "Energetic",
  SettingsAdjustmentOfVoicePresetsBtn3: "Cool",
  SettingsAdjustmentOfVoicePresetsBtn4: "Mature",
};

export default en;
